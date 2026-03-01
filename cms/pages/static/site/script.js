// SiteBiz Lab - Основной скрипт с Telegram интеграцией
document.addEventListener('DOMContentLoaded', function () {
    // ===== ПЕРЕМЕННЫЕ =====
    let freeSites = 3;
    let selectedService = '';

    // Цены и настройки продуктов (Запуск, Рост, Масштаб)
    const PRICES = {
        'launch': { base: 45000, design: 0, name: 'Запуск' },
        'growth': { base: 85000, design: 0, name: 'Рост' },
        'scale': { base: 150000, design: 0, name: 'Масштаб' },
        'landing': { base: 5000, design: 3000, name: 'Лендинг' },
        'business': { base: 20000, design: 7000, name: 'БИЗНЕС' },
        'sales': { base: 35000, design: 10000, name: 'ПРОДАЖНИК' }
    };

    // ===== DOM ЭЛЕМЕНТЫ =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const heroCta = document.getElementById('heroCta'); // "Рассчитать проект"
    const offerCta = document.getElementById('offerCta');
    const submitCta = document.getElementById('submitCta');
    const mainForm = document.getElementById('mainForm');
    const freeSitesCounter = document.getElementById('freeSitesCounter');
    const aiTrigger = document.getElementById('aiTrigger');
    const aiAgent = document.getElementById('aiAgent');
    const closeAi = document.getElementById('closeAi');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const ctaPhone = document.getElementById('ctaPhone');
    const serviceBtns = document.querySelectorAll('.btn-service');
    const serviceModal = document.getElementById('serviceModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const selectedServiceInput = document.getElementById('selectedService');
    const modalServiceInput = document.getElementById('modalServiceType');
    const serviceForm = document.getElementById('serviceForm');
    const modalSubmit = document.getElementById('modalSubmit');
    const selectedServiceName = document.getElementById('selectedServiceName');

    // Новые элементы модального окна
    const servicePriceDisplay = document.getElementById('servicePriceDisplay');
    const hasDesignToggle = document.getElementById('hasDesignToggle');
    const designPriceNote = document.getElementById('designPriceNote');
    const designPriceDiff = document.getElementById('designPriceDiff');
    const modalContact = document.getElementById('modalContact'); // Был modalPhone

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    initMobileMenu();
    initCounter();
    initPhoneMask();
    initScrollButtons();
    initForms();
    initAI();
    initServices();
    initModal();
    initCaseLightbox();
    initCaseReadMore();
    initCasesTabs();
    initCasesCarousel();
    initAnimations();
    initPerformance();

    // ===== МОБИЛЬНОЕ МЕНЮ =====
    function initMobileMenu() {
        if (!menuToggle || !mobileMenu) return;

        menuToggle.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', !isExpanded);
            this.innerHTML = mobileMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i><span class="visually-hidden">Закрыть меню</span>'
                : '<i class="fas fa-bars"></i><span class="visually-hidden">Открыть меню</span>';
        });

        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i><span class="visually-hidden">Открыть меню</span>';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Закрытие меню при клике вне
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) &&
                !menuToggle.contains(e.target) &&
                mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i><span class="visually-hidden">Открыть меню</span>';
        menuToggle.setAttribute('aria-expanded', 'false');
    }

    // ===== СЧЕТЧИК БЕСПЛАТНЫХ МЕСТ =====
    function initCounter() {
        const savedSites = localStorage.getItem('sitbizFreeSites');
        if (savedSites !== null) {
            const parsed = parseInt(savedSites);
            // Используем сохраненное значение только если оно валидное и больше 0
            if (!isNaN(parsed) && parsed > 0) {
                freeSites = parsed;
            }
            // Если сохранено 0 или невалидное значение, оставляем начальное значение 3
        }
        updateCounter();
    }

    function updateCounter() {
        if (freeSitesCounter) {
            freeSitesCounter.textContent = freeSites;
            freeSitesCounter.setAttribute('aria-label', `Осталось ${freeSites} бесплатных мест`);
        }
        localStorage.setItem('sitbizFreeSites', freeSites);
    }

    // ===== МАСКА ТЕЛЕФОНА =====
    function initPhoneMask() {
        const inputs = [ctaPhone, modalContact]; // Применяем маску ко всем полям телефона
        
        inputs.forEach(input => {
            if (!input) return;

            input.addEventListener('input', function (e) {
                // Если выбран Telegram (для модалки), маска не нужна
                if (input.id === 'modalContact' && input.getAttribute('type') === 'text' && !input.placeholder.includes('Телефон')) {
                    return;
                }
                
                // Для основной формы проверяем выбранный метод
                if (input.id === 'ctaPhone') {
                   const method = document.querySelector('input[name="contactMethod"]:checked')?.value;
                   if (method === 'telegram') return;
                }

                let value = this.value.replace(/\D/g, '');
                if (value.length === 0) {
                    this.value = '';
                    return;
                }
                if (!value.startsWith('7') && !value.startsWith('8')) {
                    value = '7' + value;
                }
                if (value.length > 11) value = value.substring(0, 11);

                let formatted = '+7';
                if (value.length > 1) {
                    const phoneNumber = value.substring(1);
                    if (phoneNumber.length > 0) formatted += ' (' + phoneNumber.substring(0, 3);
                    if (phoneNumber.length >= 4) formatted += ') ' + phoneNumber.substring(3, 6);
                    if (phoneNumber.length >= 7) formatted += '-' + phoneNumber.substring(6, 8);
                    if (phoneNumber.length >= 9) formatted += '-' + phoneNumber.substring(8, 10);
                }
                this.value = formatted;
            });

            input.addEventListener('focus', function () {
                 // Логика placeholder для телефона
                const isPhoneMode = (input.id === 'modalContact' && input.placeholder.includes('Телефон')) ||
                                   (input.id === 'ctaPhone' && document.querySelector('input[name="contactMethod"]:checked')?.value !== 'telegram');

                if (isPhoneMode && (!this.value || this.value.trim() === '')) {
                    this.value = '+7';
                    setTimeout(() => this.setSelectionRange(2, 2), 0);
                }
            });
        });
    }

    // ===== КНОПКИ СКРОЛЛА И HERO =====
    function initScrollButtons() {
        // Hero CTA -> Открывает чат бота с анимацией
        function openAiChatFromCta(source) {
            if (aiAgent && !aiAgent.classList.contains('active')) {
                aiAgent.classList.add('active');
                aiTrigger.setAttribute('aria-expanded', 'true');
                logEvent('ai_open', source);
            }
            if (aiAgent) {
                aiAgent.classList.add('shake-animation');
                setTimeout(() => aiAgent.classList.remove('shake-animation'), 1000);
            }
            const aiChat = document.getElementById('aiChat');
            if (aiChat && aiChat.children.length < 2) {
                addMessageToChat(aiChat, '👋 Привет! Ответьте на 5 коротких вопросов — вписывайте ответы в поле ввода. Подберём подходящий тариф и сориентируем по срокам.', 'ai');
            }
        }

        if (heroCta) {
            heroCta.addEventListener('click', function (e) {
                e.preventDefault();
                openAiChatFromCta('hero_cta');
            });
        }

        // О нас: кнопка «Получить разбор проекта»
        const aboutCta = document.getElementById('aboutCta');
        if (aboutCta) {
            aboutCta.addEventListener('click', function (e) {
                e.preventDefault();
                openAiChatFromCta('about_cta');
            });
        }

        // О нас: карусель «Чем мы отличаемся» (мобильная версия)
        const aboutDifferCarousel = document.getElementById('aboutDifferCarousel');
        const aboutDifferDots = document.getElementById('aboutDifferDots');
        if (aboutDifferCarousel && aboutDifferDots) {
            const cards = aboutDifferCarousel.querySelectorAll('.about-differ-card');
            const dots = aboutDifferDots.querySelectorAll('.about-differ-dot');

            function updateActiveDot() {
                const scrollLeft = aboutDifferCarousel.scrollLeft;
                const cardWidth = cards[0] ? cards[0].offsetWidth + 16 : 0; // 16 = gap
                const index = cardWidth > 0 ? Math.round(scrollLeft / cardWidth) : 0;
                const i = Math.min(index, dots.length - 1);
                dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
            }

            aboutDifferCarousel.addEventListener('scroll', updateActiveDot);
            window.addEventListener('resize', updateActiveDot);

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    const i = parseInt(dot.getAttribute('data-index'), 10);
                    const card = cards[i];
                    if (card) {
                        const cardWidth = card.offsetWidth + 16;
                        aboutDifferCarousel.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
                    }
                });
            });
        }

        // Offer CTA -> форма
        if (offerCta) {
            offerCta.addEventListener('click', function (e) {
                e.preventDefault();
                scrollToSection('contact');
                setTimeout(() => {
                    const messageInput = document.getElementById('ctaMessage');
                    if (messageInput) {
                        messageInput.value = 'Хочу обсудить проект — интересуюсь акцией «3 месяца поддержки бесплатно»';
                        messageInput.focus();
                    }
                }, 500);
            });
        }

        // Навигация
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const targetId = href.substring(1);
                // Если ссылка на #services, и есть data-service, это уже обработается в initServices
                if (targetId === 'services' && this.hasAttribute('data-service')) return;

                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    scrollToSection(targetId);
                }
            });
        });
        
        // Переключатель в главной форме (Телефон/Telegram)
        const mainContactMethods = document.querySelectorAll('input[name="contactMethod"]');
        mainContactMethods.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'telegram') {
                    ctaPhone.placeholder = 'Ваш Telegram (@username)';
                    ctaPhone.value = ''; // Очистить маску
                } else {
                    ctaPhone.placeholder = 'Телефон *';
                    ctaPhone.value = '';
                }
            });
        });
    }

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const sectionPosition = section.offsetTop - headerHeight - 20;
            window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
            if (sectionId === 'contact') {
                setTimeout(() => {
                    const nameInput = document.getElementById('ctaName');
                    if (nameInput) nameInput.focus();
                }, 500);
            }
            logEvent('scroll', sectionId);
        }
    }

    // ===== ФОРМЫ =====
    function initForms() {
        if (mainForm) {
            mainForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleMainFormSubmit();
            });
        }
        if (serviceForm) {
            serviceForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleServiceFormSubmit();
            });
        }
    }

    function handleMainFormSubmit() {
        const nameInput = document.getElementById('ctaName');
        const contactInput = document.getElementById('ctaPhone'); // Может быть телефоном или TG
        const messageInput = document.getElementById('ctaMessage');
        const contactMethod = document.querySelector('input[name="contactMethod"]:checked')?.value || 'phone';
        const privacyCheckbox = document.getElementById('mainFormPrivacy');

        if (!privacyCheckbox || !privacyCheckbox.checked) {
            showNotification('⚠️ Необходимо согласие на обработку персональных данных', 'warning');
            if (privacyCheckbox) privacyCheckbox.focus();
            return;
        }

        if (!validateContact(nameInput, contactInput, contactMethod)) return;

        const formData = {
            name: nameInput.value.trim(),
            phone: contactMethod === 'phone' ? contactInput.value.trim() : '',
            telegram: contactMethod === 'telegram' ? contactInput.value.trim() : '',
            message: messageInput ? messageInput.value.trim() : '',
            service: selectedServiceInput.value || 'Общая заявка',
            source: 'Основная форма',
            timestamp: new Date().toISOString()
        };

        submitFormData(formData, submitCta, [nameInput, contactInput, messageInput, privacyCheckbox]);
    }

    function handleServiceFormSubmit() {
        const nameInput = document.getElementById('modalName');
        const contactInput = document.getElementById('modalContact');
        const contactMethod = document.querySelector('input[name="modalContactMethod"]:checked')?.value || 'phone';
        const privacyCheckbox = document.getElementById('modalFormPrivacy');
        
        // Данные о дизайне
        const hasDesign = document.getElementById('hasDesignToggle').checked;
        const designInfo = hasDesign ? 'Есть дизайн' : 'Нет дизайна (нужна разработка)';
        const priceInfo = servicePriceDisplay.textContent;

        if (!privacyCheckbox || !privacyCheckbox.checked) {
            showNotification('⚠️ Необходимо согласие на обработку персональных данных', 'warning');
            if (privacyCheckbox) privacyCheckbox.focus();
            return;
        }

        if (!validateContact(nameInput, contactInput, contactMethod)) return;

        const formData = {
            name: nameInput.value.trim(),
            phone: contactMethod === 'phone' ? contactInput.value.trim() : '',
            telegram: contactMethod === 'telegram' ? contactInput.value.trim() : '',
            message: `Доп. инфо: ${designInfo}. Цена: ${priceInfo}.`,
            service: modalServiceInput.value,
            source: 'Карточка услуги',
            timestamp: new Date().toISOString()
        };

        submitFormData(formData, modalSubmit, [nameInput, contactInput, privacyCheckbox], () => closeModal());
    }

    function submitFormData(formData, btn, inputsToReset, onSuccessCallback) {
        showLoading(btn);
        sendToTelegram(formData).then(success => {
            if (success) {
                if (formData.message && formData.message.includes('бесплатн') && freeSites > 0) {
                    freeSites--;
                    updateCounter();
                }
                showSuccess('✅ Заявка отправлена! Мы свяжемся с вами в течение часа.');
                resetForm(inputsToReset);
                if (onSuccessCallback) onSuccessCallback();
                launchConfetti();
                logEvent('form_submit', 'success', formData.service);
            } else {
                showError('❌ Ошибка отправки. Пожалуйста, позвоните нам.');
                logEvent('form_error', 'failed');
            }
        }).catch(error => {
            console.error('Form error:', error);
            showError('⚠️ Ошибка соединения. Попробуйте еще раз.');
            logEvent('form_error', 'exception');
        }).finally(() => {
            hideLoading(btn, 'Отправить');
        });
    }

    function validateContact(nameInput, contactInput, method) {
        let isValid = true;
        if (!nameInput.value.trim()) {
            showNotification('⚠️ Введите ваше имя', 'warning');
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameInput.classList.remove('error');
        }

        const val = contactInput.value.trim();
        if (method === 'phone') {
            const phoneDigits = val.replace(/\D/g, '');
            if (!val || phoneDigits.length < 11) {
                showNotification('⚠️ Введите корректный телефон', 'warning');
                contactInput.classList.add('error');
                isValid = false;
            }
        } else {
            if (!val || val.length < 3) {
                showNotification('⚠️ Введите корректный Telegram', 'warning');
                contactInput.classList.add('error');
                isValid = false;
            }
        }
        
        if (!isValid) contactInput.classList.add('error');
        else contactInput.classList.remove('error');

        return isValid;
    }

    // ===== УСЛУГИ И МОДАЛКА =====
    function initServices() {
        if (!serviceBtns.length) return;

        serviceBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const serviceType = this.getAttribute('data-service-type');
                openServiceModal(serviceType);
                logEvent('service_click', serviceType);
            });
        });

        document.querySelectorAll('a[data-service]').forEach(link => {
            link.addEventListener('click', function (e) {
                const service = this.getAttribute('data-service');
                const serviceName = getServiceName(service);
                openServiceModal(serviceName);
                e.preventDefault();
            });
        });
    }

    function getServiceName(serviceKey) {
        const map = { 'launch': 'Запуск', 'growth': 'Рост', 'scale': 'Масштаб', 'landing': 'Лендинг', 'business': 'БИЗНЕС', 'sales': 'ПРОДАЖНИК' };
        return map[serviceKey] || serviceKey || 'Индивидуальный проект';
    }

    // ===== МОДАЛЬНОЕ ОКНО =====
    function initModal() {
        if (!serviceModal) return;

        // Переключатель Phone/Telegram в модалке
        const modalMethods = document.querySelectorAll('input[name="modalContactMethod"]');
        modalMethods.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'telegram') {
                    modalContact.placeholder = 'Ваш Telegram (@username)';
                    modalContact.value = '';
                    modalContact.setAttribute('type', 'text');
                } else {
                    modalContact.placeholder = 'Телефон *';
                    modalContact.value = '';
                    modalContact.setAttribute('type', 'tel');
                }
            });
        });

        // Тоггл дизайна
        if (hasDesignToggle) {
            hasDesignToggle.addEventListener('change', updateModalPrice);
        }

        window.openServiceModal = function(serviceName) {
            selectedService = serviceName;
            selectedServiceName.textContent = serviceName;
            selectedServiceInput.value = serviceName;
            modalServiceInput.value = serviceName;
            
            // Сброс полей
            modalContact.value = '';
            document.getElementById('modalName').value = '';
            document.querySelector('input[name="modalContactMethod"][value="phone"]').checked = true;
            modalContact.placeholder = 'Телефон *';
            if (hasDesignToggle) hasDesignToggle.checked = true; // По умолчанию дизайн есть

            updateModalPrice();

            serviceModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        };

        window.closeModal = function() {
            serviceModal.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        };

        function handleEscape(e) { if (e.key === 'Escape') window.closeModal(); }
        modalOverlay.addEventListener('click', window.closeModal);
        modalClose.addEventListener('click', window.closeModal);
    }

    // ===== ЛАЙТБОКС ФОТО В КЕЙСАХ =====
    function initCaseLightbox() {
        const lightbox = document.getElementById('caseLightbox');
        const lightboxImg = lightbox && lightbox.querySelector('.case-lightbox-img');
        const backdrop = lightbox && lightbox.querySelector('.case-lightbox-backdrop');
        const caseImages = document.querySelectorAll('.section-cases .case-visual img');

        if (!lightbox || !lightboxImg || !caseImages.length) return;

        function openLightbox(src, alt) {
            lightboxImg.src = src;
            lightboxImg.alt = alt || 'Увеличенное изображение';
            lightbox.removeAttribute('hidden');
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleLightboxEscape);
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleLightboxEscape);
            setTimeout(function () {
                lightbox.setAttribute('hidden', '');
                lightboxImg.removeAttribute('src');
            }, 250);
        }

        function handleLightboxEscape(e) {
            if (e.key === 'Escape') closeLightbox();
        }

        caseImages.forEach(function (img) {
            img.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openLightbox(this.src, this.alt);
            });
        });

        backdrop.addEventListener('click', function () {
            closeLightbox();
        });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // ===== КЕЙСЫ: «ЧИТАТЬ ДАЛЕЕ» — МОДАЛКА С ПОЛНЫМ ОПИСАНИЕМ =====
    function initCaseReadMore() {
        const section = document.querySelector('.section-cases');
        const modal = document.getElementById('caseDescriptionModal');
        if (!section || !modal) return;

        const titleEl = modal.querySelector('.case-description-modal-title');
        const bodyEl = modal.querySelector('.case-description-modal-body');
        const overlay = modal.querySelector('.case-description-modal-overlay');
        const closeBtn = modal.querySelector('.case-description-modal-close');

        function openCaseModal(title, bodyHtml) {
            titleEl.textContent = title;
            bodyEl.innerHTML = bodyHtml || '';
            modal.removeAttribute('hidden');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleCaseModalEscape);
        }

        function closeCaseModal() {
            modal.setAttribute('hidden', '');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleCaseModalEscape);
        }

        function handleCaseModalEscape(e) {
            if (e.key === 'Escape') closeCaseModal();
        }

        section.addEventListener('click', function (e) {
            const btn = e.target.closest('.case-read-more-btn');
            if (!btn) return;
            e.preventDefault();
            const card = btn.closest('.case-card');
            if (!card) return;
            const title = card.querySelector('h3');
            const template = card.querySelector('template.case-description-full');
            const bodyHtml = template ? template.innerHTML : '';
            openCaseModal(title ? title.textContent : 'Кейс', bodyHtml);
        });

        if (overlay) overlay.addEventListener('click', closeCaseModal);
        if (closeBtn) closeBtn.addEventListener('click', closeCaseModal);
    }

    // ===== ТАБЫ КАТЕГОРИЙ В «НАШИ РАБОТЫ» =====
    function initCasesTabs() {
        const tabs = document.querySelectorAll('.section-cases .cases-tab');
        const cards = document.querySelectorAll('.section-cases .case-card');
        if (!tabs.length || !cards.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var filter = this.getAttribute('data-filter');
                tabs.forEach(function (t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                cards.forEach(function (card) {
                    var cat = card.getAttribute('data-category');
                    var show = filter === 'all' || cat === filter;
                    card.style.display = show ? '' : 'none';
                });
            });
        });
    }

    // ===== КАРУСЕЛЬ КЕЙСОВ =====
    function initCasesCarousel() {
        const inner = document.getElementById('casesCarouselInner');
        const prevBtn = document.querySelector('.cases-carousel-prev');
        const nextBtn = document.querySelector('.cases-carousel-next');
        const grid = document.getElementById('casesGrid');
        if (!inner || !prevBtn || !nextBtn || !grid) return;

        function getScrollStep() {
            const firstCard = grid.querySelector('.case-card');
            if (!firstCard) return inner.clientWidth * 0.8;
            return firstCard.offsetWidth + 24;
        }

        prevBtn.addEventListener('click', function () {
            inner.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function () {
            inner.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
    }

    // ===== МОДАЛЬНОЕ ОКНО ПОЛИТИКИ КОНФИДЕНЦИАЛЬНОСТИ =====
    function initPrivacyModal() {
        const privacyLink = document.getElementById('privacyPolicy');
        const privacyModal = document.getElementById('privacyModal');
        const privacyModalOverlay = document.getElementById('privacyModalOverlay');
        const privacyModalClose = document.getElementById('privacyModalClose');

        if (!privacyLink || !privacyModal) return;

        function openPrivacyModal() {
            privacyModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handlePrivacyEscape);
        }

        function closePrivacyModal() {
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handlePrivacyEscape);
        }

        function handlePrivacyEscape(e) {
            if (e.key === 'Escape') closePrivacyModal();
        }

        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            openPrivacyModal();
        });

        if (privacyModalOverlay) {
            privacyModalOverlay.addEventListener('click', closePrivacyModal);
        }

        if (privacyModalClose) {
            privacyModalClose.addEventListener('click', closePrivacyModal);
        }
    }

    initPrivacyModal();

    // Обработчики ссылок на политику конфиденциальности в формах
    const privacyLinks = document.querySelectorAll('.privacy-link');
    privacyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const privacyModal = document.getElementById('privacyModal');
            if (privacyModal) {
                privacyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function updateModalPrice() {
        // Определяем ключ сервиса по имени
        let serviceKey = '';
        if (selectedService === 'Запуск') serviceKey = 'launch';
        else if (selectedService === 'Рост') serviceKey = 'growth';
        else if (selectedService === 'Масштаб') serviceKey = 'scale';
        else if (selectedService === 'Лендинг' || selectedService === 'ЛЕНДИНГ') serviceKey = 'landing';
        else if (selectedService === 'БИЗНЕС' || selectedService === 'Бизнес') serviceKey = 'business';
        else if (selectedService === 'ПРОДАЖНИК' || selectedService === 'Продажник') serviceKey = 'sales';

        if (!serviceKey || !PRICES[serviceKey]) {
             servicePriceDisplay.textContent = '';
             designPriceNote.style.display = 'none';
             return;
        }

        const config = PRICES[serviceKey];
        const hasDesign = hasDesignToggle.checked;
        const currentPrice = hasDesign ? config.base : (config.base + config.design);
        
        servicePriceDisplay.textContent = `Ориентировочная стоимость: ${currentPrice.toLocaleString()} ₽`;
        
        if (!hasDesign && config.design > 0) {
            designPriceDiff.textContent = config.design.toLocaleString();
            designPriceNote.style.display = 'block';
        } else {
            designPriceNote.style.display = 'none';
        }
    }

    // ===== AI АГЕНТ =====
    function initAI() {
        if (!aiTrigger || !aiAgent) return;

        aiTrigger.addEventListener('click', () => {
            const isActive = aiAgent.classList.contains('active');
            aiAgent.classList.toggle('active');
            aiTrigger.setAttribute('aria-expanded', !isActive);
            localStorage.setItem('aiManuallyOpened', 'true');
            if (!isActive) logEvent('ai_open', 'manual');
        });

        closeAi.addEventListener('click', () => {
            aiAgent.classList.remove('active');
            aiTrigger.setAttribute('aria-expanded', 'false');
            resetChatOptions();
        });

        // Логика чата
        const quickActions = document.getElementById('quickActions');
        const optionsGrid = document.getElementById('optionsGrid');
        const aiChat = document.getElementById('aiChat');

        quickBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const answer = this.getAttribute('data-answer');
                addMessageToChat(aiChat, answer, 'user');

                if (answer === 'Да, начать') {
                    setTimeout(() => {
                        addMessageToChat(aiChat, QUESTION_STEPS[0].question, 'ai');
                        showQuestionInput(aiChat, quickActions, optionsGrid, 0, []);
                        logEvent('ai_interaction', 'start_questionnaire');
                    }, 500);
                } else {
                    setTimeout(() => {
                        addMessageToChat(aiChat, getAIResponse(answer), 'ai');
                    }, 500);
                }
            });
        });
    }

    const QUESTION_STEPS = [
        { question: 'Какова цель проекта?' },
        { question: 'Чем занимается ваш бизнес?' },
        { question: 'Какой функционал планируете?' },
        { question: 'Будут ли какие-то конкретные пожелания по дизайну?' },
        { question: 'Когда планируете запуск?' }
    ];

    function showQuestionInput(aiChat, quickActions, optionsGrid, stepIndex, answers) {
        const step = QUESTION_STEPS[stepIndex];
        if (!step) {
            showContactFormInChat(aiChat, quickActions, optionsGrid, answers);
            return;
        }

        quickActions.style.display = 'none';
        optionsGrid.style.display = 'block';
        optionsGrid.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'ai-chat-input-wrap';
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:8px; width:100%;';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Введите ваш ответ...';
        input.className = 'ai-chat-text-input';
        input.style.cssText = 'width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border, #e2e8f0); font-size:0.95rem;';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.textContent = 'Далее';
        btn.style.cssText = 'align-self:flex-end;';

        btn.addEventListener('click', function () {
            const value = (input.value || '').trim();
            if (!value) {
                showNotification('Введите ответ', 'warning');
                input.focus();
                return;
            }
            addMessageToChat(aiChat, value, 'user');
            const nextAnswers = [...(answers || []), { step: stepIndex, value: value }];
            optionsGrid.style.display = 'none';
            optionsGrid.innerHTML = '';

            const nextStep = stepIndex + 1;
            setTimeout(() => {
                if (nextStep < QUESTION_STEPS.length) {
                    addMessageToChat(aiChat, QUESTION_STEPS[nextStep].question, 'ai');
                    showQuestionInput(aiChat, quickActions, optionsGrid, nextStep, nextAnswers);
                } else {
                    showContactFormInChat(aiChat, quickActions, optionsGrid, nextAnswers);
                }
            }, 400);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
        });

        wrap.appendChild(input);
        wrap.appendChild(btn);
        optionsGrid.appendChild(wrap);
        input.focus();
    }

    const QUESTION_LABELS = ['Цель', 'Тип бизнеса', 'Функционал', 'Дизайн', 'Сроки'];

    function showContactFormInChat(aiChat, quickActions, optionsGrid, answers) {
        let priceMessage = 'Отлично! Спасибо за ответы. Ориентир по нашим тарифам: <strong>Старт</strong> от 25 000 ₽, <strong>Система роста</strong> от 55 000 ₽, <strong>Масштаб</strong> от 85 000 ₽. Свяжемся и подберём вариант под вас.';
        addMessageToChat(aiChat, priceMessage, 'ai');
        setTimeout(() => {
            addMessageToChat(aiChat, 'Укажите, пожалуйста, ваше имя и номер телефона или ник в Telegram — после этого отправим заявку.', 'ai');
            
            // Создаем форму прямо в чате
            const formContainer = document.createElement('div');
            formContainer.className = 'ai-message ai-form-container';
            formContainer.innerHTML = `
                <div class="message-bubble" style="background: white; border: 1px solid var(--border); width: 100%;">
                    <div class="form-row" style="margin-bottom: 10px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">Способ связи:</label>
                        <select id="chatContactMethod" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ddd;">
                            <option value="phone">Телефон</option>
                            <option value="telegram">Telegram</option>
                        </select>
                    </div>
                    <div class="form-row" style="margin-bottom: 10px;">
                        <input type="text" id="chatName" placeholder="Ваше имя" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ddd;">
                    </div>
                    <div class="form-row" style="margin-bottom: 10px;">
                        <input type="text" id="chatContact" placeholder="Телефон" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ddd;">
                    </div>
                    <div class="form-row" style="margin-bottom: 10px; display:none;">
                        <textarea id="chatComment" placeholder="Комментарий (необязательно)" rows="2" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ddd;"></textarea>
                    </div>
                    <div class="form-row" style="margin-bottom: 10px;">
                        <label class="privacy-checkbox-label" style="display:flex; align-items:flex-start; gap:8px; font-size:0.85rem; cursor:pointer;">
                            <input type="checkbox" id="chatPrivacy" required style="margin-top:0.15em; flex-shrink:0; width:1em; height:1em; min-width:1em; min-height:1em; max-width:1em; max-height:1em; cursor:pointer; appearance:none; -webkit-appearance:none; -moz-appearance:none; border:2px solid #e2e8f0; border-radius:50%; background:white; position:relative; transition:all 0.3s; padding:0; box-sizing:border-box;">
                            <span>Я согласен(а) на <a href="#" id="privacyPolicyChatForm" class="privacy-link" style="color:var(--primary); text-decoration:none;">обработку персональных данных</a></span>
                        </label>
                    </div>
                    <button id="chatSubmitBtn" style="width:100%; background:var(--primary); color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">Отправить заявку</button>
                </div>
            `;
            aiChat.appendChild(formContainer);
            aiChat.scrollTop = aiChat.scrollHeight;

            // Логика формы в чате
            const methodSelect = formContainer.querySelector('#chatContactMethod');
            const contactInput = formContainer.querySelector('#chatContact');
            const submitBtn = formContainer.querySelector('#chatSubmitBtn');
            const chatPrivacyCheckbox = formContainer.querySelector('#chatPrivacy');
            
            // Стилизация чекбокса в чате
            if (chatPrivacyCheckbox) {
                // Создаем элемент для точки (круглый чекбокс)
                const checkmark = document.createElement('span');
                const fontSize = parseFloat(getComputedStyle(chatPrivacyCheckbox.parentElement).fontSize);
                const dotSize = fontSize * 0.4;
                checkmark.style.cssText = `position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); width:${dotSize}px; height:${dotSize}px; border-radius:50%; background:white; display:none; pointer-events:none;`;
                chatPrivacyCheckbox.appendChild(checkmark);
                
                chatPrivacyCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        this.style.background = 'var(--primary)';
                        this.style.borderColor = 'var(--primary)';
                        checkmark.style.display = 'block';
                    } else {
                        this.style.background = 'white';
                        this.style.borderColor = '#e2e8f0';
                        checkmark.style.display = 'none';
                    }
                });
            }

            methodSelect.addEventListener('change', () => {
                contactInput.placeholder = methodSelect.value === 'telegram' ? 'Ваш Telegram (@user)' : 'Телефон';
            });

            // Обработчик ссылки на политику конфиденциальности в форме чата
            const privacyLinkChat = formContainer.querySelector('#privacyPolicyChatForm');
            if (privacyLinkChat) {
                privacyLinkChat.addEventListener('click', function(e) {
                    e.preventDefault();
                    const privacyModal = document.getElementById('privacyModal');
                    if (privacyModal) {
                        privacyModal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            }

            submitBtn.addEventListener('click', () => {
                const name = formContainer.querySelector('#chatName').value;
                const contact = contactInput.value;
                const comment = formContainer.querySelector('#chatComment').value;
                const method = methodSelect.value;
                const privacyCheckbox = formContainer.querySelector('#chatPrivacy');

                if (!name || !contact) {
                    showNotification('Пожалуйста, заполните имя и контакт', 'warning');
                    return;
                }

                if (!privacyCheckbox.checked) {
                    showNotification('Необходимо согласие на обработку персональных данных', 'warning');
                    privacyCheckbox.focus();
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';

                const labels = QUESTION_LABELS || [];
                const answerLines = (answers || []).map(a => `${labels[a.step] || 'Вопрос'}: ${a.value}`).join('; ');
                const fullData = {
                    name,
                    phone: method === 'phone' ? contact : '',
                    telegram: method === 'telegram' ? contact : '',
                    message: `Заявка из чата. ${answerLines}. Коммент: ${comment}`,
                    service: 'Чат-бот (опрос)',
                    source: 'AI Chat'
                };

                sendToTelegram(fullData).then(ok => {
                    if (ok) {
                        formContainer.remove();
                        addMessageToChat(aiChat, '✅ Спасибо! Данные отправлены. Мы скоро свяжемся с вами.', 'ai');
                        launchConfetti();
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Ошибка, попробуйте еще раз';
                    }
                });
            });

        }, 800);
    }

    function addMessageToChat(chatContainer, text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = `<p>${text}</p>`;
        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function getAIResponse(question) {
        if (question === 'Расскажите про акцию') {
             return `🎁 <strong>АКЦИЯ</strong><br>Запуститесь сейчас — получите <strong>3 месяца поддержки бесплатно</strong>: исправление ошибок, доработки, консультации по развитию, помощь с аналитикой. Ориентировочно 15 000 – 25 000 ₽ — сейчас бесплатно при запуске. Обсудить проект можно в форме на сайте.`;
        }
        if (question === 'Показать примеры') {
            return `Наши кейсы вы можете посмотреть в разделе "Наши работы" на странице. Там есть примеры реализованных проектов с результатами.`;
        }
        return `Могу помочь подобрать вариант проекта. Нажмите "Да, начать", чтобы пройти короткий опрос.`;
    }

    function resetChatOptions() {
        if (quickBtns) document.getElementById('quickActions').style.display = 'flex';
        const opts = document.getElementById('optionsGrid');
        if (opts) { opts.style.display = 'none'; opts.innerHTML = ''; }
    }

    // ===== ОТПРАВКА ЗАЯВКИ НА СЕРВЕР (Django) =====
    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }
    async function sendToTelegram(formData) {
        const url = '/api/contact/';
        const csrf = getCsrfToken();
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone || '',
                    telegram: formData.telegram || '',
                    message: formData.message || '',
                    service: formData.service || 'Не указано',
                    source: formData.source || 'Форма на сайте'
                })
            });
            const data = res.ok ? {} : await res.json().catch(function() { return {}; });
            if (res.ok) return true;
            console.error('API error:', data.error || res.statusText);
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    function resetForm(inputs) {
        inputs.forEach(i => { 
            if(i) {
                if (i.type === 'checkbox') {
                    i.checked = false;
                } else {
                    i.value = '';
                }
            }
        });
    }
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ВОССТАНОВЛЕНЫ) =====
    function showLoading(button) {
        if (!button) return;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
        button.disabled = true;
    }

    function hideLoading(button, defaultText) {
        if (!button) return;
        button.innerHTML = button.dataset.originalText || defaultText;
        button.disabled = false;
        delete button.dataset.originalText;
    }

    function showNotification(text, type = 'success') {
        // Удаляем старые уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<p>${text}</p>`;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '9999',
            transform: 'translateX(120%)',
            transition: 'transform 0.3s ease',
            maxWidth: 'min(350px, calc(100vw - 40px))'
        });

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.style.transform = 'translateX(0)');
        
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    function showSuccess(text) { showNotification(text, 'success'); }
    function showError(text) { showNotification(text, 'error'); }

    function launchConfetti() {
        const colors = ['#2563eb', '#059669', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < 40; i++) {
            setTimeout(() => createConfettiPiece(colors), i * 30);
        }
    }

    function createConfettiPiece(colors) {
        const confetti = document.createElement('div');
        Object.assign(confetti.style, {
            position: 'fixed',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            background: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            top: '-20px',
            left: `${Math.random() * 100}vw`,
            zIndex: '9998',
            pointerEvents: 'none',
            opacity: '0.9'
        });
        document.body.appendChild(confetti);
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });
        animation.onfinish = () => confetti.remove();
    }

    function logEvent(category, action, label = '') {
        console.log(`📊 Event: ${category} - ${action} ${label}`);
    }

    function initPerformance() {
         // Lazy loading (упрощено)
         if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target.dataset.src) {
                        entry.target.src = entry.target.dataset.src;
                        observer.unobserve(entry.target);
                    }
                });
            });
            document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
        }
    }
    
    function initAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .process-card, .team-card, .case-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        animatedElements.forEach(el => {
             el.style.opacity = '0';
             el.style.transform = 'translateY(30px)';
             el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
             observer.observe(el);
        });
    }

    // ===== CAROUSEL =====
    function initCarousel() {
        const track = document.getElementById('servicesTrack');
        if (!track) return;

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dotsContainer = document.getElementById('carouselDots');
        const cards = Array.from(track.children);
        
        if (!cards.length) return;

        // Generate dots
        if (dotsContainer) {
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    const cardWidth = cards[0].offsetWidth + 30; // 30 is gap
                    track.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth'
                    });
                });
                dotsContainer.appendChild(dot);
            });
        }

        // Update dots on scroll
        track.addEventListener('scroll', () => {
            if (!dotsContainer) return;
            const dots = Array.from(dotsContainer.children);
            const cardWidth = cards[0].offsetWidth + 30;
            const scrollPos = track.scrollLeft;
            const activeIndex = Math.round(scrollPos / cardWidth);
            
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });

        // Button navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth + 30;
                track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth + 30;
                track.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });
        }
    }

});