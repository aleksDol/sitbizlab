# Деплой SiteBiz Lab на Beget

Пошаговая инструкция: что поменять в проекте и как развернуть сайт на Beget (домен уже куплен, виртуальный хостинг или VPS подключён).

---

## Что сделать до деплоя

### 1. Настройки для продакшена (через .env на сервере)

На сервере в папке проекта создайте файл **`.env`** (рядом с `manage.py`). Не коммитьте его в git.

```env
# Обязательно поменять на продакшене
DJANGO_DEBUG=0
DJANGO_SECRET_KEY=ваш-длинный-случайный-секрет-минимум-50-символов
ALLOWED_HOSTS=ваш-домен.ru,www.ваш-домен.ru

# Опционально: Telegram для заявок
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

- **DJANGO_SECRET_KEY** — сгенерируйте новый ключ (например: `python -c "import secrets; print(secrets.token_urlsafe(50))"`).
- **ALLOWED_HOSTS** — через запятую: ваш домен без `https://`, с `www` и без (например: `sitebizlab.ru,www.sitebizlab.ru`).

Текущий проект уже читает эти переменные из `.env` (через `python-dotenv`), поэтому менять `settings.py` не обязательно — достаточно правильного `.env` на сервере.

### 2. Статика и медиа

- **STATIC_ROOT** уже задан: `staticfiles/`. На сервере нужно один раз выполнить:  
  `python manage.py collectstatic --noinput`
- Папку **assets** (картинки с рабочего стола) нужно либо положить в репозиторий (например в `cms/static/site/assets/`), либо загрузить на сервер и при необходимости поправить `STATICFILES_DIRS` в `config/settings.py`, чтобы путь указывал на папку на сервере.

### 3. База данных

Сейчас используется **SQLite** (`db.sqlite3`). Для продакшена на одном сервере этого достаточно. Файл `db.sqlite3` должен лежать в папке проекта (рядом с `manage.py`); после первого деплоя выполните миграции (см. шаги ниже).

Если позже решите перейти на **PostgreSQL** (часто так делают на VPS Beget), в `.env` можно добавить переменные, а в `config/settings.py` — блок чтения БД из окружения (см. раздел VPS ниже).

---

## Вариант A: Деплой на VPS Beget (рекомендуется для Django)

Подходит, если у вас **VPS** (виртуальный выделенный сервер) в Beget. Полный контроль: Nginx, Gunicorn, своя БД.

Официальная инструкция Beget: [Развертывание Django с Nginx, PostgreSQL и Gunicorn](https://beget.com/ru/kb/how-to/vps/razvertyvanie-django-s-pomoshchyu-nginx-postgresql-i-gunicorn).

### Шаг 1. Подключитесь к VPS по SSH

Используйте логин и пароль (или ключ), выданные при создании VPS. Пример:

```bash
ssh пользователь@ваш-сервер.beget.tech
```

### Шаг 2. Установите необходимое ПО

```bash
sudo apt update
sudo apt install python3-pip python3-dev python3-venv libpq-dev nginx
```

Если будете использовать только SQLite, пакеты `libpq-dev`, `postgresql` и `postgresql-contrib` можно не ставить.

### Шаг 3. Загрузите проект на сервер

**Способ 1 — через Git (удобно для обновлений):**

```bash
cd ~
git clone https://ваш-репозиторий.git myproject
cd myproject
# Если проект в подпапке cms:
cd cms
```

**Способ 2 — через SFTP/Файловый менеджер Beget:**  
Залейте папку проекта (например `cms` со всеми файлами) в домашнюю директорию, например `~/myproject/cms/`.

### Шаг 4. Виртуальное окружение и зависимости

```bash
cd ~/myproject/cms   # или ~/myproject, если manage.py в корне
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Шаг 5. Файл .env на сервере

Создайте в папке с `manage.py` файл `.env` (см. раздел «Что сделать до деплоя»). Обязательно: `DJANGO_DEBUG=0`, свой `DJANGO_SECRET_KEY`, в `ALLOWED_HOSTS` — ваш домен.

### Шаг 6. База данных и миграции

Для SQLite:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

Для PostgreSQL (если настроили БД в панели Beget или установили Postgres на VPS) — в `config/settings.py` добавьте чтение БД из переменных окружения и заполните их в `.env`, затем выполните те же команды: `migrate`, `createsuperuser`, `collectstatic`.

### Шаг 7. Проверка запуска через Gunicorn

В папке с `manage.py` (и откуда виден каталог `config`):

```bash
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 config.wsgi:application
```

Откройте в браузере `http://IP-вашего-сервера:8000`. Если сайт открывается — останавливайте Gunicorn (Ctrl+C) и переходите к настройке systemd и Nginx.

### Шаг 8. Сервис Gunicorn (systemd)

Создайте файл (подставьте свой пользователь и путь к проекту):

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Содержимое (замените `beget` на вашего пользователя и пути на свои):

```ini
[Unit]
Description=gunicorn daemon for SiteBiz Lab
After=network.target

[Service]
User=beget
Group=www-data
WorkingDirectory=/home/beget/myproject/cms
ExecStart=/home/beget/myproject/cms/venv/bin/gunicorn --workers 3 --bind unix:/home/beget/myproject/cms/gunicorn.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl status gunicorn
```

### Шаг 9. Nginx

Создайте конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/sitebizlab
```

Пример (замените домен и пути):

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        alias /home/beget/myproject/cms/staticfiles/;
    }
    location /media/ {
        alias /home/beget/myproject/cms/media/;
    }
    location / {
        proxy_pass http://unix:/home/beget/myproject/cms/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включите сайт и перезапустите Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/sitebizlab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 10. Домен в панели Beget

1. Зайдите в [cp.beget.com](https://cp.beget.com) → **Сайты** (или **Домены**).
2. Привяжите домен к вашему VPS: укажите A-запись на IP вашего VPS или используйте подсказки Beget для подключения домена к серверу.

### Шаг 11. SSL (HTTPS)

В панели Beget можно включить бесплатный SSL (Let's Encrypt) для домена. После этого в Nginx добавьте конфиг для порта 443 с `ssl_certificate` и `ssl_certificate_key` (пути подскажет панель) или перенаправление с 80 на 443.

---

## Вариант B: Виртуальный хостинг Beget (без VPS)

На обычном виртуальном хостинге Beget Django запускается через **Passenger** и Python-окружение в Docker.

Краткий порядок действий:

1. **Создать сайт в панели Beget**  
   Раздел «Сайты» → добавить домен/поддомен → указать корневую папку сайта (например `ваш-логин.beget.tech` или домен).

2. **Загрузить проект**  
   По SFTP или через Файловый менеджер загрузите папку `cms` (или весь проект) в корень сайта. Структура должна быть такой, чтобы `manage.py` и папка `config` лежали в корне сайта (или в одной подпапке, тогда пути ниже нужно поправить).

3. **Подключиться к Docker-окружению по SSH**  
   В базе знаний Beget: [Общие сведения по установке приложений (Docker)](https://beget.com/ru/kb/how-to/web-apps/obshhie-svedeniya-po-ustanovke-prilozhenij-virtualnoe-okruzhenie-docker). Обычно: `ssh ваш-логин@ваш-сайт.beget.tech`, затем `ssh localhost -p 222`.

4. **Виртуальное окружение и зависимости**  
   В каталоге сайта:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Файл passenger_wsgi.py в корне сайта**  
   Создайте в корне сайта (там, откуда виден `config`) файл `passenger_wsgi.py`:

   ```python
   # -*- coding: utf-8 -*-
   import os
   import sys

   # Путь к папке с проектом (корень сайта или папка cms)
   project_dir = '/home/б/ваш-логин/ваш-сайт.beget.tech'  # замените на свой путь
   sys.path.insert(0, project_dir)
   sys.path.insert(1, os.path.join(project_dir, 'venv', 'lib', 'python3.10', 'site-packages'))

   os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

   Путь `project_dir` узнайте по факту: это полный путь к каталогу, где лежит `manage.py`. Путь к `site-packages` зависит от версии Python в venv (3.10, 3.11 и т.д.).

6. **.htaccess**  
   В корне сайта создайте или отредактируйте `.htaccess`:

   ```apache
   PassengerEnabled On
   PassengerPython /home/б/ваш-логин/ваш-сайт.beget.tech/venv/bin/python3
   ```

   Замените путь на полный путь к `python3` внутри вашего venv.

7. **.env**  
   В той же папке создайте `.env` с `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS=ваш-домен.ru,www.ваш-домен.ru`.

8. **Миграции и статика**  
   В Docker-окружении, с активированным venv:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic --noinput
   ```

9. **Симлинк для статики (если требуется)**  
   По инструкциям Beget иногда создают симлинк `public` на `public_html`. Если статика отдаётся неверно — уточните в справке Beget для Python/Django.

10. **Перезапуск Passenger**  
    ```bash
    touch tmp/restart.txt
    ```
    (Каталог `tmp` должен существовать в корне сайта.)

На виртуальном хостинге ограничения по версии Python и путям — при проблемах лучше открыть тикет в поддержке Beget с указанием, что разворачиваете Django.

---

## Что поменять в проекте (кратко)

| Где | Что |
|-----|-----|
| **Сервер** | Создать `.env`: `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS=ваш-домен.ru,www.ваш-домен.ru` |
| **Сервер** | Выполнить: `migrate`, `createsuperuser`, `collectstatic` |
| **Панель Beget** | Привязать домен к сайту / VPS, при необходимости включить SSL |
| **Локально** | Ничего не обязательно — продакшен управляется через `.env` на сервере |

Если нужно использовать другую базу (PostgreSQL) или другой путь к статике — это делается через переменные окружения и при необходимости правки `config/settings.py` (чтение из `os.environ`).

---

## После деплоя

- Откройте `https://ваш-домен.ru` и `https://ваш-домен.ru/admin` — проверьте, что сайт и админка открываются.
- В админке проверьте разделы: главный экран, услуги, кейсы, заявки, настройки сайта.
- Отправьте тестовую заявку с формы и проверьте, что она сохраняется и приходит в Telegram (если настроен).

Если что-то не работает — проверьте логи: на VPS это `sudo journalctl -u gunicorn` и `/var/log/nginx/error.log`; на виртуальном хостинге — раздел «Логи» в панели Beget и тикет в поддержку.
