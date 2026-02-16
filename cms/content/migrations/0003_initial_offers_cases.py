# Generated data migration — акции и кейсы

from django.db import migrations


def create_offers(apps, schema_editor):
    Offer = apps.get_model('content', 'Offer')
    if Offer.objects.exists():
        return
    Offer.objects.create(
        title='3 месяца поддержки бесплатно',
        lead_text='Запуститесь сейчас — получите',
        description='Исправление технических ошибок, небольшие доработки, консультации по развитию, помощь с аналитикой.',
        button_text='Обсудить проект',
        places_left=5,
        is_active=True,
        order=0,
    )


def create_cases(apps, schema_editor):
    Case = apps.get_model('content', 'Case')
    if Case.objects.exists():
        return
    Case.objects.bulk_create([
        Case(
            title='Организуем похороны «Под ключ»',
            category='business',
            description='Лендинг для похоронного агентства под ключ: форма заявки, блок с услугами, доверие и скорость отклика.',
            kpi_line_1='−55% стоимость заявки',
            kpi_line_2='+27 заявок за первый месяц',
            platform='Tilda',
            launch_days='16 дней',
            order=1,
            is_published=True,
        ),
        Case(
            title='Научим с уверенностью работать в Excel за 2 недели',
            category='education',
            description='Лендинг для онлайн-школы по Excel: программа, отзывы, запись на курс и интеграция с рассылкой.',
            kpi_line_1='−53% стоимость лида',
            kpi_line_2='3,7 → 5,6% конверсия заявки',
            platform='Tilda',
            launch_days='12 дней',
            order=2,
            is_published=True,
        ),
        Case(
            title='Ваш дизайн интерьера под ключ',
            category='services',
            description='Лендинг для дизайнера интерьера: портфолио, этапы работы, форма заявки и калькулятор ориентировочной стоимости.',
            kpi_line_1='−44% стоимость обращения',
            kpi_line_2='+22 обращения за первый месяц',
            platform='Tilda',
            launch_days='14 дней',
            order=3,
            is_published=True,
        ),
    ])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_initial_data'),
    ]

    operations = [
        migrations.RunPython(create_offers, reverse_noop),
        migrations.RunPython(create_cases, reverse_noop),
    ]
