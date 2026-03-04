from django.urls import path
from django.contrib.sitemaps.views import sitemap

from . import views
from .sitemaps import StaticViewSitemap, CaseSitemap

urlpatterns = [
    path('', views.home, name='home'),
    path('razrabotka-saitov/', views.landing_sites, name='landing_sites'),
    path('telegram-boty/', views.landing_bots, name='landing_bots'),
    path('mini-apps/', views.landing_miniapps, name='landing_miniapps'),
    path('cases/<slug:slug>/', views.case_detail, name='case_detail'),
    path('api/contact/', views.contact_submit, name='contact_submit'),
    path('robots.txt', views.robots_txt),
    path('sitemap.xml', sitemap, {'sitemaps': {'static': StaticViewSitemap, 'cases': CaseSitemap}}, name='django.contrib.sitemaps.views.sitemap'),
]
