# Google Tag Manager - Enhanced Ecommerce #

Støtter disse funksjonene
- ProductImpression 
    - Vil da si når er produkt blir vist i en liste sammen med andre produkter
    - Typisk brukt i
        - Produktliste
        - Produktsøk
        - Relaterte produkter
        - Alternative produkter
    - Når et produkt klikkes for å gå inn på. Kan bruke til alt mulig rart
    - Typisk brukt i
        - Produktliste
        - Produktsøk
        - Relaterte produkter
        - Alternative produkter
        - Produktkort
        - Handlevogn
- ProduktDetail
    - Når man er inne på et enkelt produkt.
    - Typisk bruk
        - Produktkort
- AddToCart
    - Måler legg i handlevogn
    - Typisk bruk
        - Alle steder der man har kjøpsknapp til produktet
- RemoveFromCart
    - Måler fjern fra handlevogn.
    - Typisk bruk
        - Handlevogn

## Hovedoppsett ##
For å sette opp tag manager må man legge inn referanse til scriptet, og deretter kjøre initialiser datalayer-funksjonen.
currencyCode er optional, productData må settes. productData er data-tagen som brukes til å hente produkt-data som en JSON string. I dette tilfellet vil da data-taggen bli: data-frigg-gtm-product.
```
<script src="../frigg-cms-tag-manager.js"></script>
<script>
  friggTagManagerEcommerce.initiateDataLayerWithEcommerce({currencyCode: 'NOK', productData: 'friggGtmProduct'});
</script>
```

ProduktData må alltid settes i en data-tag som en JSON string. Eksempel:
```
data-frigg-gtm-product='{"id": "123", "name": "Løve", "price": "100.00", "brand": "Afrika", "category": "Dyr", "variant": "Hann", "list": "Produktsøk"}'
```

## Debugging ##
Ved å legge til debug parameter i url (eks www.sdf.sdf?debug) vil det dukke opp logger i console. I tillegg vil eventCallback ikke bli utført.

## ProductImpression ##
Eksempel på hvordan dette kan settes opp. "selector" er da måten elementet hentes på i JQuery. Produktet settes også opp i en data-tag som er definert i hovedoppsettet.
```
friggTagManagerEcommerce.measureProductImpressions({selector: '[data-frigg-gtm-impression]'});

<div data-frigg-gtm-impression data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": "", "list": "Produktsøk"}'>
</div>
```

## Parametere til klikk-eventer ##
For klikk eventer må man alltid legge til et objekt som inneholder den dataen man trenger
Name|HTML Type|Required|Description
--- | --- | --- | ---
element | `Alle` | Ja | Elementet der JSON-produktdata-tagen befinner seg. Hvis produkt-data befinner seg i anchor-elementet så spesifiseres kun denne.
anchorElement | `<a>` | Nei | Hvis element ikke er anchor elementet men kun inneholder produkt-data må også anchorElement legges til
quantityElement | `<input>` | Nei | **Kun legg til /fjern fra handlevogn!** Input elementet der antall settes. Hvis elementet mangler, eller value ikke kan finnes så settes antall automatisk til 1.

Dersom verken element eller anchorElement har href satt opp, vil det ikke være noe redirekt.

Eksempel: 
```
friggTagManagerEcommerce.measureRemoveProductFromCart({element: this.parentElement, anchorElement: this, quantityElement: this.parentElement.children[1]});
```

## ProductClick ##
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureProductClick({element: this.parentElement, anchorElement: this})">
    </a>
</div>
```

## ProductAddToCart ##
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureaddProductToCart({element: this.parentElement, anchorElement: this, quantityElement: this.parentElement.children[2]})">
    </a>
</div>
```

## ProductRemoveFromCart ##
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureRemoveProductFromCart({element: this.parentElement, anchorElement: this, quantityElement: this.parentElement.children[1]});">
    </a>
</div>
```