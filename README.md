# Paweł Matujewicz — strona osobista

Prosta, statyczna strona publikowana przez GitHub Pages. Nie wymaga Node.js,
instalacji pakietów ani kompilacji.

## Uruchomienie lokalne

W katalogu repozytorium uruchom:

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

Do edycji i podglądu można też użyć dowolnego serwera plików statycznych.

## Edycja

- `index.html` — treść strony, dane kontaktowe i odnośniki.
- `css/personal.css` — bezpośrednio edytowane style oraz reguły responsywności.
- `img/profile.jpg` — zdjęcie profilowe.
- `img/favicon.svg` — ikona strony.

Po zmianach sprawdź stronę na telefonie i komputerze, nawigację klawiaturą oraz
odnośniki. Style nie są generowane — zapisany CSS jest od razu używany przez stronę.

Plik `LICENSE` zachowuje informację o licencji pierwotnego szablonu.
