# Generated data migration — начальные данные для CMS

from django.db import migrations


def create_services(apps, schema_editor):
    Service = apps.get_model('content', 'Service')
    if Service.objects.exists():
        return
    Service.objects.bulk_create([
        Service(
            name='Запуск',
            slug='launch',
            short_description='Для теста ниши и старта рекламы',
            price_from='от 45 000 ₽',
            features='Вы запускаете новый продукт\nПрорабатываете связки\nХотите получать заявки\n\nСтруктура под продажи\nИндивидуальный дизайн\nНастройка аналитики\nПодключение форм\nБазовая SEO-оптимизация',
            is_featured=False,
            order=1,
        ),
        Service(
            name='Рост',
            slug='growth',
            short_description='Сильное предложение для роста в нише',
            price_from='от 85 000 ₽',
            features='Уже есть заявки\nНужно расти в нише\nХотите завоевать рынок\n\nГлубокий анализ ниши\nПродуманный дизайн\nСайт с логикой воронки\nИнтеграция с CRM\nБазовая аналитика\nСрок адаптации к аудитории',
            is_featured=True,
            order=2,
        ),
        Service(
            name='Масштаб',
            slug='scale',
            short_description='Для дела, для роста рекламы',
            price_from='от 150 000 ₽',
            features='Стабильный поток трафика\nВысокая конверсия\nСложные интеграции\n\nАрхитектура проекта\nМногостраничный сайт\nИнтеграции\nПодключение отчётов\nПриоритетная поддержка',
            is_featured=False,
            order=3,
        ),
    ])


def create_hero(apps, schema_editor):
    HeroBlock = apps.get_model('content', 'HeroBlock')
    if HeroBlock.objects.exists():
        return
    HeroBlock.objects.create(
        title='Сайты, которые работают как система продаж, ',
        title_highlight='а не как визитка',
        subtitle='Проектируем структуру, продумываем логику, подключаем аналитику и автоматизацию — чтобы сайт приносил заявки.',
        note='Ответим в течение 15 минут. Без навязывания.',
        is_active=True,
    )


def create_site_setting(apps, schema_editor):
    SiteSetting = apps.get_model('content', 'SiteSetting')
    if SiteSetting.objects.exists():
        return
    SiteSetting.objects.create(
        pk=1,
        site_name='SiteBiz Lab',
        email='sitebiz-lab@ya.ru',
        telegram='https://t.me/siteBiz_lab',
        vk='https://vk.com/sitebizlab',
        meta_description='SiteBiz Lab - создаем сайты, которые работают. От 24 часов. Оплата после результата.',
    )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_services, reverse_noop),
        migrations.RunPython(create_hero, reverse_noop),
        migrations.RunPython(create_site_setting, reverse_noop),
    ]
