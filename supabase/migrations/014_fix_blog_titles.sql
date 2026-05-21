-- Fix blog post titles to sentence case (not every word capitalized).

UPDATE blog_posts SET title = 'LED крушки H7 — как да изберем правилно (ръководство 2025)'
WHERE slug = 'led-krushki-h7-naiden-naybdobriat-vibor';

UPDATE blog_posts SET title = 'LED крушки с CANBUS — какво е и защо има значение'
WHERE slug = 'canbus-led-krushki-obiasnienie';

UPDATE blog_posts SET title = 'Как да изберем LED крушки за кола — пълен наръчник'
WHERE slug = 'kak-da-izbera-led-krushki-za-kola';

UPDATE blog_posts SET title = 'Полиране на фарове — кога е необходимо и какви са ползите'
WHERE slug = 'poliranje-na-farove-koga-i-zashto';
