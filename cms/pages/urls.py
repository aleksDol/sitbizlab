from django.urls import path
from django.contrib.sitemaps.views import sitemap

from . import views
from .sitemaps import StaticViewSitemap

urlpatterns = [
    path('', views.home, name='home'),
    path('api/contact/', views.contact_submit, name='contact_submit'),
    path('robots.txt', views.robots_txt),
    path('sitemap.xml', sitemap, {'sitemaps': {'static': StaticViewSitemap}}, name='django.contrib.sitemaps.views.sitemap'),
]
