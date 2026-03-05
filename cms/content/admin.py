from django.contrib import admin
from django.utils.html import format_html
from .models import HeroBlock, Service, Case, Offer, Lead, SiteSetting


@admin.register(HeroBlock)
class HeroBlockAdmin(admin.ModelAdmin):
    list_display = ('title', 'title_highlight', 'is_active')
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    search_fields = ('title', 'subtitle')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_from', 'is_featured', 'order')
    list_editable = ('price_from', 'is_featured', 'order')
    list_filter = ('is_featured',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'product_type', 'category', 'is_published', 'order', 'preview_image')
    list_editable = ('order', 'is_published')
    list_filter = ('product_type', 'category', 'is_published')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}

    def preview_image(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 40px; border-radius: 4px;" />',
                obj.image.url
            )
        return '—'
    preview_image.short_description = 'Превью'


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'places_left', 'is_active', 'order')
    list_editable = ('order', 'is_active', 'places_left')
    list_filter = ('is_active',)
    search_fields = ('title',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'contact_method', 'source', 'service_type', 'is_processed', 'created_at')
    list_editable = ('is_processed',)
    list_filter = ('contact_method', 'is_processed', 'created_at')
    search_fields = ('name', 'contact', 'message', 'source', 'service_type')
    readonly_fields = ('name', 'contact', 'contact_method', 'message', 'source', 'service_type', 'created_at')
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('name', 'contact', 'contact_method', 'message', 'is_processed', 'created_at')
        }),
        ('Откуда заявка', {
            'fields': ('source', 'service_type'),
            'description': 'С какой страницы пришла заявка и на какую услугу/тариф (если выбирали в разделе услуг или на странице Сайты).'
        }),
    )


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'phone', 'email')

    def has_add_permission(self, request):
        return not SiteSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
