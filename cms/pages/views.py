import html
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from content.models import HeroBlock, Service, Case, Offer, SiteSetting, Lead

logger = logging.getLogger(__name__)


def get_telegram_config():
    token = (os.environ.get('TELEGRAM_BOT_TOKEN') or getattr(settings, 'TELEGRAM_BOT_TOKEN', '') or '').strip()
    chat_id = (os.environ.get('TELEGRAM_CHAT_ID') or getattr(settings, 'TELEGRAM_CHAT_ID', '') or '').strip()
    return token, chat_id


def send_telegram_message(text: str) -> bool:
    token, chat_id = get_telegram_config()
    if not token or not chat_id:
        logger.warning('Telegram: не заданы TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID (проверьте .env и перезапустите сервер)')
        return False
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }).encode('utf-8')
    try:
        req = urllib.request.Request(url, data=data, method='POST', headers={'Content-Type': 'application/x-www-form-urlencoded'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            out = json.loads(body) if body else {}
            if not out.get('ok'):
                logger.warning('Telegram API ошибка: %s', out.get('description', body))
                return False
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else ''
        try:
            err_data = json.loads(err_body)
            logger.warning('Telegram HTTP %s: %s', e.code, err_data.get('description', err_body))
        except Exception:
            logger.warning('Telegram HTTP %s: %s', e.code, err_body)
        return False
    except Exception as e:
        logger.exception('Telegram отправка не удалась: %s', e)
        return False


def robots_txt(request):
    """robots.txt для поисковых систем."""
    base = request.build_absolute_uri('/').rstrip('/')
    sitemap_url = f'{base}/sitemap.xml'
    content = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /admin/\n'
        f'Sitemap: {sitemap_url}\n'
    )
    return HttpResponse(content, content_type='text/plain; charset=utf-8')


@ensure_csrf_cookie
def home(request):
    hero = HeroBlock.objects.filter(is_active=True).first()
    services = list(Service.objects.all())
    cases = list(Case.objects.filter(is_published=True))
    offers = list(Offer.objects.filter(is_active=True))
    site = SiteSetting.load()
    base_url = request.build_absolute_uri('/').rstrip('/')
    canonical_url = base_url + '/'
    og_image_path = static('site/assets/logo.png')
    og_image_url = request.build_absolute_uri(og_image_path) if og_image_path.startswith('/') else (base_url + '/' + og_image_path.lstrip('/'))
    return render(request, 'pages/home.html', {
        'hero': hero,
        'services': services,
        'cases': cases,
        'offers': offers,
        'site': site,
        'canonical_url': canonical_url,
        'base_url': base_url,
        'og_image_url': og_image_url,
    })


@require_http_methods(['POST'])
def contact_submit(request):
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST
        name = (data.get('name') or '').strip()
        phone = (data.get('phone') or '').strip()
        telegram = (data.get('telegram') or '').strip()
        message = (data.get('message') or '').strip()
        service = (data.get('service') or 'Не указано').strip()
        source = (data.get('source') or 'Форма на сайте').strip()
        contact_method = 'telegram' if telegram else 'phone'
        contact = telegram if contact_method == 'telegram' else phone
        if not name or not contact:
            return JsonResponse({'ok': False, 'error': 'Имя и контакт обязательны'}, status=400)
        Lead.objects.create(
            name=name,
            contact=contact,
            contact_method=contact_method,
            message=message,
            service_type=service,
        )
        # Экранируем пользовательский ввод для Telegram (parse_mode=HTML)
        safe = lambda s: html.escape(str(s), quote=True)
        text = (
            f"📩 <b>ЗАЯВКА С САЙТА</b>\n"
            f"<b>Услуга:</b> {safe(service)}\n"
            f"<b>Источник:</b> {safe(source)}\n\n"
            f"<b>Имя:</b> {safe(name)}\n"
            f"<b>Телефон:</b> {safe(phone) if phone else '—'}\n"
            f"<b>Telegram:</b> {safe(telegram) if telegram else '—'}\n"
            f"<b>Сообщение:</b> {safe(message) if message else '—'}"
        )
        send_telegram_message(text)
        return JsonResponse({'ok': True})
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.exception('contact_submit: %s', e)
        if settings.DEBUG:
            return JsonResponse({'ok': False, 'error': str(e)}, status=500)
        return JsonResponse({'ok': False, 'error': 'Произошла ошибка. Попробуйте позже или свяжитесь с нами по телефону.'}, status=500)
