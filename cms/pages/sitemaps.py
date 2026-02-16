# Sitemap для поисковых систем (SEO)
from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    """Главная страница и статические разделы (якоря — одна страница)."""
    priority = 0.9
    changefreq = 'weekly'

    def items(self):
        return ['home']

    def location(self, item):
        return reverse(item)
