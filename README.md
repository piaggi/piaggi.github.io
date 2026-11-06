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

## Nagranie karaoke

Sekcja „Po godzinach” zawiera jeden odtwarzacz z listą 10 najczęściej odtwarzanych nagrań, wybranych
z dostarczonego eksportu (privacy=0 i count_plays > 100), bez tokenu, iframe
i linku do profilu iSing. Kolejność ustalono na podstawie eksportu. Interfejs pokazuje tylko tytuły i czas nagrania.
Wybór utworu wstrzymuje poprzedni; nie ma automatycznego odtwarzania ani przechodzenia
do następnego utworu. Lista korzysta ze zwykłych przycisków obsługiwanych klawiaturą.
Bez JavaScriptu natywny odtwarzacz udostępnia tylko początkowe nagranie. Safari korzysta z natywnego HLS; pozostałe wspierane przeglądarki
wczytują lokalne `vendor/hls/hls.min.js` (hls.js 1.6.13, licencja w tym samym folderze)
dopiero po kliknięciu „Wczytaj nagranie”. Kod integracji: `js/karaoke.js`.

Odtwarzanie wymaga dostępności serwera `w.ising.pl`; dla hls.js serwer musi zezwalać
na CORS dla playlist i segmentów. Sama dostępność adresu w nowej karcie nie
potwierdza działania odtwarzacza na innej domenie. Brak autoplay i preload nagrania.
