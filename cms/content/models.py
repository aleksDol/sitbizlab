from django.db import models


class HeroBlock(models.Model):
    """Главный экран (hero) — заголовок, подзаголовок, текст под кнопками."""
    title = models.CharField('Заголовок', max_length=200)
    title_highlight = models.CharField(
        'Выделенная часть заголовка (синим)',
        max_length=100,
        blank=True,
        help_text='Например: «а не как визитка»'
    )
    subtitle = models.TextField('Подзаголовок', blank=True)
    note = models.CharField(
        'Текст под кнопками',
        max_length=200,
        blank=True,
        help_text='Например: Ответим в течение 15 минут. Без навязывания.'
    )
    is_active = models.BooleanField('Использовать на сайте', default=True)

    class Meta:
        verbose_name = 'Главный экран'
        verbose_name_plural = 'Главный экран'

    def __str__(self):
        return self.title[:50]


class Service(models.Model):
    """Услуги (Запуск, Рост, Масштаб)."""
    name = models.CharField('Название', max_length=100)
    slug = models.SlugField('Код', max_length=50, unique=True)
    short_description = models.CharField('Краткое описание', max_length=200, blank=True)
    price_from = models.CharField('Цена от', max_length=50, blank=True)
    features = models.TextField(
        'Что входит (каждый пункт с новой строки)',
        blank=True,
        help_text='Один пункт на строку'
    )
    is_featured = models.BooleanField('Выделенная карточка', default=False)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ('order', 'pk')

    def __str__(self):
        return self.name

    def get_features_suitable(self):
        """Пункты «Подойдет если» (до двойного переноса строки)."""
        parts = self.features.split('\n\n', 1)
        if not parts: return []
        return [x.strip() for x in parts[0].split('\n') if x.strip()]

    def get_features_included(self):
        """Пункты «Включено» (после двойного переноса строки)."""
        parts = self.features.split('\n\n', 1)
        if len(parts) < 2: return []
        return [x.strip() for x in parts[1].split('\n') if x.strip()]


class Case(models.Model):
    """Кейсы / портфолио."""
    CATEGORY_CHOICES = [
        ('business', 'Для бизнеса'),
        ('education', 'Для образования'),
        ('services', 'Для услуг'),
        ('startups', 'Для стартапов'),
    ]
    PRODUCT_TYPE_CHOICES = [
        ('sites', 'Сайты'),
        ('bots', 'Telegram-боты'),
        ('miniapps', 'MiniApps'),
    ]
    title = models.CharField('Название проекта', max_length=200)
    slug = models.SlugField('URL кейса', max_length=120, unique=True, blank=True,
                           help_text='Для страницы кейса. Оставьте пустым — подставится из названия.')
    category = models.CharField('Категория', max_length=20, choices=CATEGORY_CHOICES, default='business')
    product_type = models.CharField(
        'Продукт (фильтр на главной)',
        max_length=20,
        choices=PRODUCT_TYPE_CHOICES,
        default='sites',
        blank=True,
    )
    description = models.TextField('Описание', blank=True)
    kpi_line_1 = models.CharField('KPI строка 1', max_length=100, blank=True)
    kpi_line_2 = models.CharField('KPI строка 2', max_length=100, blank=True)
    image = models.ImageField('Изображение', upload_to='cases/', blank=True, null=True)
    platform = models.CharField('Платформа', max_length=100, blank=True)
    launch_days = models.CharField('Срок запуска', max_length=50, blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    is_published = models.BooleanField('Опубликовано', default=True)

    class Meta:
        verbose_name = 'Кейс'
        verbose_name_plural = 'Кейсы / Портфолио'
        ordering = ('order', '-pk')

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            from django.utils.text import slugify
            base = slugify(self.title)[:100] or 'case'
            self.slug = base
            idx = 1
            while Case.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f'{base}-{idx}'[:120]
                idx += 1
        super().save(*args, **kwargs)


class Offer(models.Model):
    """Акция / спецпредложение (блок «Акция»)."""
    title = models.CharField('Заголовок', max_length=200)
    lead_text = models.CharField('Вводный текст', max_length=200, blank=True)
    description = models.TextField('Описание', blank=True)
    button_text = models.CharField('Текст кнопки', max_length=100, default='Узнать подробнее')
    places_left = models.PositiveSmallIntegerField('Осталось мест', default=5, null=True, blank=True)
    is_active = models.BooleanField('Акция активна', default=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Акция'
        verbose_name_plural = 'Акции'
        ordering = ('order', 'pk')

    def __str__(self):
        return self.title


class Lead(models.Model):
    """Заявки с формы сайта."""
    CONTACT_CHOICES = [
        ('phone', 'Телефон'),
        ('telegram', 'Telegram'),
    ]
    name = models.CharField('Имя', max_length=200)
    contact = models.CharField('Телефон или Telegram', max_length=200)
    contact_method = models.CharField('Способ связи', max_length=20, choices=CONTACT_CHOICES, default='phone')
    message = models.TextField('Сообщение', blank=True)
    service_type = models.CharField('Тип услуги', max_length=100, blank=True)
    created_at = models.DateTimeField('Дата заявки', auto_now_add=True)
    is_processed = models.BooleanField('Обработано', default=False)

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} — {self.created_at.strftime("%d.%m.%Y %H:%M")}'


class SiteSetting(models.Model):
    """Настройки сайта (контакты, соцсети) — одна запись."""
    site_name = models.CharField('Название сайта', max_length=100, default='SiteBiz Lab')
    phone = models.CharField('Телефон', max_length=50, blank=True)
    email = models.EmailField('Email', blank=True)
    telegram = models.URLField('Telegram', blank=True)
    vk = models.URLField('VK', blank=True)
    meta_description = models.CharField('Описание для поисковиков', max_length=300, blank=True)

    class Meta:
        verbose_name = 'Настройки сайта'
        verbose_name_plural = 'Настройки сайта'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
