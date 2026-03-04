# Sitemap для поисковых систем (SEO)
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from content.models import Case


class StaticViewSitemap(Sitemap):
    """Главная и лендинги продуктов."""
    priority = 0.9
    changefreq = 'weekly'

    def items(self):
        return ['home', 'landing_sites', 'landing_bots', 'landing_miniapps']

    def location(self, item):
        return reverse(item)


class CaseSitemap(Sitemap):
    """Страницы кейсов."""
    priority = 0.7
    changefreq = 'monthly'

    def items(self):
        return Case.objects.filter(is_published=True).exclude(slug='')

    def location(self, obj):
        return reverse('case_detail', args=[obj.slug])
