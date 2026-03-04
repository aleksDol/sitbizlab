# SiteBiz Lab — админка и CMS на Django

Красивая и понятная панель управления контентом сайта SiteBiz Lab.

## Что внутри

- **Главный экран (Hero)** — заголовок, подзаголовок, текст под кнопками
- **Услуги** — карточки (Запуск, Рост, Масштаб): название, цена, описание, что входит
- **Кейсы / Портфолио** — проекты с фото, категорией, KPI и описанием
- **Акции** — блок спецпредложений (заголовок, описание, «осталось мест»)
- **Заявки** — все заявки с формы сайта (имя, контакт, сообщение, дата)
- **Настройки сайта** — контакты, соцсети, meta-описание (одна запись)

Оформление: тема **Jazzmin** (современный сайдбар, читаемые формы, иконки) + свой CSS для аккуратного вида.

## Установка и запуск

### 1. Перейти в папку и создать виртуальное окружение

```bash
cd cms
python -m venv venv
```

### 2. Активировать venv

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (cmd):**
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Установить зависимости

```bash
pip install -r requirements.txt
```

### 4. Миграции и суперпользователь

```bash
python manage.py migrate
python manage.py createsuperuser
```

Введите логин, email и пароль для входа в админку.

### 5. Запуск сервера

```bash
python manage.py runserver
```

- **Сайт:** http://127.0.0.1:8000/
- **Админка:** http://127.0.0.1:8000/admin/

Контент на главной странице (герой, услуги, кейсы, акции, футер) берётся из базы — редактируйте в админке, изменения сразу отображаются на сайте.

## Первый вход

1. Откройте http://127.0.0.1:8000/admin/
2. Войдите под созданным суперпользователем
3. В меню слева: **Контент сайта** — «Главный экран», «Услуги», «Кейсы», «Акции», «Заявки», «Настройки сайта»

## Переменные окружения (по желанию)

- `DJANGO_SECRET_KEY` — секретный ключ (обязательно сменить в продакшене)
- `DJANGO_DEBUG` — `True` / `False`
- `ALLOWED_HOSTS` — через запятую, например: `sitebiz-lab.ru,www.sitebiz-lab.ru`
- `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` — для дублирования заявок в Telegram (если не заданы, заявки только сохраняются в админке)

## Структура проекта

```
cms/
├── config/          # настройки Django, urls, wsgi
├── content/         # приложение CMS (модели, админка)
├── pages/           # приложение «Сайт» (главная, форма заявок)
│   ├── templates/pages/home.html
│   └── static/site/ # style.css, script.js, assets/
├── manage.py
├── requirements.txt
└── README.md
```

## SEO

- **robots.txt** — `GET /robots.txt`: разрешает индексацию сайта, запрещает `/admin/`, указывает на `Sitemap`.
- **sitemap.xml** — `GET /sitemap.xml`: карта сайта (главная страница) для поисковиков.
- **Мета и соцсети**: в шаблоне главной заданы `description`, `keywords`, canonical, Open Graph и Twitter Card.
- **JSON-LD**: разметка Organization и WebSite для Google и Яндекса.
- **meta_description** настраивается в админке: «Настройки сайта» → «Описание для поисковиков».

## Обновление сайта: залить на GitHub и на сервер

### Часть 1. С ПК на GitHub

1. Откройте терминал (PowerShell или cmd) и перейдите в папку проекта:
   ```bash
   cd c:\Users\dolma\Desktop\sitbizlab
   ```

2. Посмотрите, что изменено:
   ```bash
   git status
   ```

3. Добавьте все изменения в коммит:
   ```bash
   git add .
   ```

4. Создайте коммит (подставьте своё описание):
   ```bash
   git commit -m "Описание изменений"
   ```

5. Отправьте на GitHub:
   ```bash
   git push
   ```
   При запросе введите логин и пароль (или токен) GitHub.

---

### Часть 2. На сервере (VPS)

1. Подключитесь по SSH (подставьте свой логин и IP):
   ```bash
   ssh root@IP_сервера
   ```

2. Перейдите в папку проекта и подтяните изменения:
   ```bash
   cd ~/sitbizlab
   git pull
   ```

3. Если добавлялись или менялись зависимости в `requirements.txt`:
   ```bash
   cd cms
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

4. Если добавлялись миграции БД (новые или изменённые модели):
   ```bash
   cd cms
   source venv/bin/activate
   python3 manage.py migrate
   cd ..
   ```

5. Если менялись статика (CSS, JS, картинки в `static` или `assets`):
   ```bash
   cd cms
   source venv/bin/activate
   python3 manage.py collectstatic --noinput
   cd ..
   ```

6. Перезапустите Gunicorn:
   ```bash
   sudo systemctl restart gunicorn
   ```

7. Проверьте статус:
   ```bash
   sudo systemctl status gunicorn
   ```
   Должно быть `active (running)`.

---

**Минимум** (только правки шаблонов или кода, без новых пакетов и миграций): после `git pull` достаточно выполнить **шаг 6** (`sudo systemctl restart gunicorn`).

---

## Ускорение загрузки сайта

Уже сделано в проекте:
- **preconnect** для шрифтов Google — браузер раньше подключается к серверам шрифтов.
- **loading="lazy"** у картинок (кейсы, блок «Чем отличаемся», акция) — изображения ниже экрана подгружаются при прокрутке.
- **defer** у основного `script.js` — скрипт не блокирует отрисовку страницы.

Что настроить на сервере (Nginx):

1. **Сжатие gzip** — меньше трафика, быстрее загрузка. В конфиг сайта (внутри блока `server` для 443) добавьте:
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   gzip_min_length 256;
   ```

2. **Кэш для статики** — браузер будет хранить CSS/JS/картинки и не качать их при каждом заходе. В том же конфиге, в блоках `location /static/` и `location /media/` добавьте заголовки:
   ```nginx
   location /static/ {
       alias /root/sitbizlab/cms/staticfiles/;
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   location /media/ {
       alias /root/sitbizlab/cms/media/;
       expires 7d;
       add_header Cache-Control "public, immutable";
   }
   ```
   После правок: `sudo nginx -t` и `sudo systemctl reload nginx`.

По желанию:
- **Картинки** — сжать `difference.png`, `promotion.png`, `bg-service.jpg` (например через [TinyPNG](https://tinypng.com/) или `cwebp`), затем снова выполнить `collectstatic` на сервере.
- **Шрифты** — в шаблоне подключены не все начертания Inter; если оставить только 400 и 600, запрос к Google Fonts станет легче (сейчас: 300;400;500;600;700).

---

## Как запустить сайт на ПК (кратко)

1. Откройте терминал и перейдите в папку проекта:  
   `cd путь\к\sitbizlab\cms`

2. Создайте и активируйте виртуальное окружение:  
   `python -m venv venv`  
   Затем: **Windows** — `.\venv\Scripts\Activate.ps1` или `venv\Scripts\activate.bat`; **macOS/Linux** — `source venv/bin/activate`

3. Установите зависимости:  
   `pip install -r requirements.txt`

4. Примените миграции и создайте учётную запись админки:  
   `python manage.py migrate`  
   `python manage.py createsuperuser`  
   (введите логин, email и пароль)

5. Запустите сервер:  
   `python manage.py runserver`

6. Откройте в браузере:
   - **Главная:** http://127.0.0.1:8000/
   - **Сайты:** http://127.0.0.1:8000/razrabotka-saitov/
   - **Telegram-боты:** http://127.0.0.1:8000/telegram-boty/
   - **MiniApps:** http://127.0.0.1:8000/mini-apps/
   - **Админка:** http://127.0.0.1:8000/admin/

Кейсы с заполненным полем «URL кейса» (slug) открываются по адресу вида:  
http://127.0.0.1:8000/cases/имя-kejsa/
