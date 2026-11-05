# Paweł Matujewicz — strona osobista

Statyczna strona publikowana przez GitHub Pages. Do uruchomienia nie wymaga Node.js,
instalacji pakietów ani kompilacji.

## Uruchomienie lokalne

W katalogu repozytorium:

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

## Edycja

- `index.html` — treść, doświadczenie i dane kontaktowe.
- `css/personal.css` — bezpośrednio edytowane style.
- `img/2.jpg` — zdjęcie w powitaniu, `img/1.jpg` — zdjęcie w sekcji „O mnie”.
- `img/favicon.svg` — ikona strony.
- `cv/index.html`, `cv/cv.css` — samodzielny profil zawodowy bez danych osobowych,
  zdjęcia, nazw klientów i dokładnych dat. Nie zawiera linku do strony osobistej.
- `cv/java-developer.pdf` — wersja do pobrania, wygenerowana z `cv/index.html`.

Po edycji CV odśwież PDF z dokumentu HTML przez drukowanie w przeglądarce (A4,
bez nagłówków i stopek z adresem). Sprawdź tekst oraz metadane gotowego PDF.
Dokument zamieszczony na podpisanej stronie nadal da się powiązać z jej właścicielem.
Oryginalnego CV z danymi osobowymi nie należy dodawać do repozytorium.

Zdjęcia są częścią układu, bez galerii i skryptów. Po zmianach sprawdź widok mobilny,
nawigację klawiaturą i linki, w tym pobieranie CV.

`LICENSE` zachowuje informację o licencji pierwotnego szablonu.
