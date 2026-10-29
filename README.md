# kt02 — REST API каталога товаров

## Запуск
```bash
npm install
cp .env.example .env   # если .env нет
npm start              # или npm run dev
```
Сервер: http://localhost:3000

## Маршруты
| Метод | URL | Описание |
|---|---|---|
| GET | /api/products | Список (category, minPrice, maxPrice, page, limit) |
| GET | /api/products/:id | Один товар |
| POST | /api/products | Создать |
| PUT | /api/products/:id | Заменить полностью |
| PATCH | /api/products/:id | Обновить частично |
| DELETE | /api/products/:id | Удалить |
| POST | /api/products/:id/image | Загрузить изображение (form-data, поле `image`, JPEG/PNG до 2 МБ) |

## Примеры
```bash
curl -X POST localhost:3000/api/products -H "Content-Type: application/json" \
  -d '{"name":"Phone","price":500,"category":"electronics","stock":5}'

curl "localhost:3000/api/products?category=electronics&minPrice=100&page=1&limit=10"

curl -F image=@photo.png localhost:3000/api/products/1/image
```
