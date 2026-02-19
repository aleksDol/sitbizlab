# Data migration — обновление текста главного экрана

from django.db import migrations


def update_hero_text(apps, schema_editor):
    HeroBlock = apps.get_model('content', 'HeroBlock')
    hero = HeroBlock.objects.first()
    if hero:
        hero.title = 'Создаём цифровые системы продаж, '
        hero.title_highlight = 'а не просто сайты'
        hero.subtitle = (
            'Проектируем структуру, продумываем логику — '
            'чтобы вы получали заявки, а не просто трафик.'
        )
        hero.save()
    else:
        HeroBlock.objects.create(
            title='Создаём цифровые системы продаж, ',
            title_highlight='а не просто сайты',
            subtitle=(
                'Проектируем структуру, продумываем логику — '
                'чтобы вы получали заявки, а не просто трафик.'
            ),
            note='Ответим в течение 15 минут. Без навязывания.',
            is_active=True,
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_update_services_tariffs'),
    ]

    operations = [
        migrations.RunPython(update_hero_text, noop_reverse),
    ]
