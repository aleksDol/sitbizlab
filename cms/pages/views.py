import html
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
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


def _base_context(request):
    site = SiteSetting.load()
    base_url = request.build_absolute_uri('/').rstrip('/')
    canonical_url = base_url + request.path
    if not canonical_url.endswith('/'):
        canonical_url += '/'
    og_image_path = static('site/assets/logo.png')
    og_image_url = request.build_absolute_uri(og_image_path) if og_image_path.startswith('/') else (base_url + '/' + og_image_path.lstrip('/'))
    cases = list(Case.objects.filter(is_published=True)[:6])
    return {
        'site': site,
        'base_url': base_url,
        'canonical_url': canonical_url,
        'og_image_url': og_image_url,
        'cases': cases,
    }


# Пакеты для разработки сайтов (лендинг /razrabotka-saitov/)
SITE_PACKAGES = [
    {
        'name': '«Быстрый старт»',
        'icon': 'fa-rocket',
        'for_who': 'Для запуска новой ниши, теста гипотезы, первого выхода в онлайн',
        'features': [
            'Продающий лендинг',
            'Современный адаптивный дизайн',
            'Продуманная структура под конверсию',
            'Формы захвата заявок',
            'Telegram-бот для уведомлений о заявках',
            'Базовая аналитика',
        ],
        'price': 'от 15 000 ₽',
    },
    {
        'name': '«Бизнес-решение»',
        'icon': 'fa-building',
        'for_who': 'Для компаний с потоком клиентов, которым нужно расти системно',
        'features': [
            'Многостраничный сайт',
            'Интеграции',
            'Настройка воронки продаж',
            'Расширенная аналитика конверсий',
            'Админ-панель для управления контентом',
            'Telegram-бот с логикой обработки заявок',
        ],
        'price': 'от 40 000 ₽',
    },
    {
        'name': '«Экосистема»',
        'icon': 'fa-layer-group',
        'for_who': 'Для масштабирования и построения полноценной цифровой платформы',
        'features': [
            'Архитектура всей цифровой системы',
            'Сайт + Telegram-бот или MiniApp',
            'Личный кабинет пользователя',
            'Сквозная аналитика',
            'AI помощники',
            'Автоматизация задач',
        ],
        'price': 'от 75 000 ₽',
    },
]

# Пакеты для разработки Telegram-ботов (лендинг /telegram-boty/)
BOT_PACKAGES = [
    {
        'name': '«Бот-помощник»',
        'icon': 'fa-headset',
        'for_who': 'Для автоматического приёма заявок, уведомлений и снижения нагрузки на персонал',
        'features': [
            'Бот для приёма заявок/бронирований',
            'Автоуведомления сотрудникам в Telegram',
            'Простая админ-панель',
            'Сбор контактов и информации о клиентах',
            'Базовые сценарии общения',
            '(Возможен парсинг и автоматизация дополнительно)',
        ],
        'price': 'от 10 000 ₽',
    },
    {
        'name': '«Бот-продавец»',
        'icon': 'fa-shopping-cart',
        'for_who': 'Для бизнеса, который хочет продавать через Telegram',
        'features': [
            'Каталог товаров/услуг внутри бота',
            'AI консультант',
            'Сегментированные рассылки по базе',
            'Авторекомендации (cross-sell)',
            'Статусы заказов для клиента',
            'Расширенный функционал админ-панели',
        ],
        'price': 'от 35 000 ₽',
    },
    {
        'name': '«Бот-экосистема»',
        'icon': 'fa-cogs',
        'for_who': 'Для построения полноценного канала продаж и автоматизации',
        'features': [
            'Сложная логика и сценарии',
            'Многоуровневые роли (админ, менеджер, клиент)',
            'Личный кабинет клиента',
            'Интеграция с сайтом',
            'Сквозная аналитика',
            'Система реферальных программ',
        ],
        'price': 'от 50 000 ₽',
    },
]

# Пакеты для разработки MiniApps (лендинг /mini-apps/)
MINIAPP_PACKAGES = [
    {
        'name': '«MiniApp Витрина»',
        'icon': 'fa-store',
        'for_who': 'Для презентации товаров/услуг внутри Telegram с удобным интерфейсом',
        'features': [
            'Одностраничное мини-приложение',
            'Адаптивный интерфейс',
            'Каталог с фильтрацией',
            'Формы обратной связи',
            'Быстрый запуск без модерации',
            'Просмотр на мобильных и ПК',
        ],
        'price': 'от 30 000 ₽',
    },
    {
        'name': '«MiniApp Маркет»',
        'icon': 'fa-shopping-bag',
        'for_who': 'Для полноценных продаж и взаимодействия с клиентами внутри Telegram',
        'features': [
            'Многостраничное приложение',
            'Корзина',
            'Профиль пользователя и история заказов',
            'Система уведомлений',
            'Админ-панель для управления',
            'Интеграция с Telegram-ботом и сайтом',
        ],
        'price': 'от 50 000 ₽',
    },
    {
        'name': '«MiniApp Платформа»',
        'icon': 'fa-rocket',
        'for_who': 'Для сложных IT-решений, маркетплейсов, сервисов с виральным эффектом',
        'features': [
            'Индивидуальная архитектура',
            'Сложные алгоритмы (рекомендации, лайки, рейтинги)',
            'Реферальная программа',
            'Геймификация и задания',
            'Полная аналитика поведения',
            'Масштабируемая backend-архитектура',
        ],
        'price': 'от 75 000 ₽',
    },
]


def landing_sites(request):
    ctx = _base_context(request)
    ctx['page_title'] = 'Разработка сайтов'
    ctx['meta_description'] = 'Разработка сайтов, которые продают. Лендинги и многостраничные сайты с CRM и аналитикой. Под ключ за 5–10 дней.'
    cases_sites = list(Case.objects.filter(is_published=True, product_type='sites')[:4])
    offers = list(Offer.objects.filter(is_active=True))
    return render(request, 'pages/landing_sites.html', {**ctx, 'site_packages': SITE_PACKAGES, 'cases_sites': cases_sites, 'offers': offers})


def landing_bots(request):
    ctx = _base_context(request)
    ctx['page_title'] = 'Telegram-боты'
    ctx['meta_description'] = 'Telegram-боты для автоматизации продаж, записи, заявок и поддержки клиентов. Создаём ботов под ключ.'
    cases_bots = list(Case.objects.filter(is_published=True, product_type='bots')[:4])
    offers = list(Offer.objects.filter(is_active=True))
    return render(request, 'pages/landing_bots.html', {**ctx, 'bot_packages': BOT_PACKAGES, 'cases_bots': cases_bots, 'offers': offers})


def landing_miniapps(request):
    ctx = _base_context(request)
    ctx['page_title'] = 'MiniApps для Telegram'
    ctx['meta_description'] = 'Создание мини-приложений (MiniApps) для Telegram: маркетплейсы, сервисы, каталоги. Быстрый запуск без модерации магазинов приложений.'
    cases_miniapps = list(Case.objects.filter(is_published=True, product_type='miniapps')[:4])
    offers = list(Offer.objects.filter(is_active=True))
    return render(request, 'pages/landing_miniapps.html', {**ctx, 'miniapp_packages': MINIAPP_PACKAGES, 'cases_miniapps': cases_miniapps, 'offers': offers})


def case_detail(request, slug):
    case = get_object_or_404(Case, slug=slug, is_published=True)
    ctx = _base_context(request)
    ctx['page_title'] = case.title
    ctx['meta_description'] = (case.description or case.title)[:300]
    ctx['case'] = case
    return render(request, 'pages/case_detail.html', ctx)


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
        service = (data.get('service') or data.get('selectedService') or 'Не указано').strip()
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
            source=source,
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
