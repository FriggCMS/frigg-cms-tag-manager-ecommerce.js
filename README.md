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
- Transaction
    - Gjennomført ordre, denne må settes i Frigg-admin
    - [AnalyticsTypeID] må settes til 2 i PubSystemUrl
    - Transaksjon trigger en event som heter "transactionEvent" som må registreres i GTM.

## Oppsett i HTML-mal ##
For å sette opp tag manager må man legge inn referanse til scriptet, og deretter kjøre initialiser datalayer-funksjonen.
currencyCode er optional, productData må settes. productData er data-tagen som brukes til å hente produkt-data som en JSON string. I dette tilfellet vil da data-taggen bli: data-frigg-gtm-product.
```html
<script src="../frigg-cms-tag-manager-ecommerce.js"></script>
<script>
    <!-- Initierer dataLayer, må alltid være med! -->
    friggTagManagerEcommerce.initiateDataLayerWithEcommerce({currencyCode: 'NOK', productData: 'friggGtmProduct'});

    <!-- Product impression, settes opp i hovedmal! -->
    friggTagManagerEcommerce.measureProductImpressions({selector: '[data-frigg-gtm-impression]'});
</script>
```

ProduktData må alltid settes i en data-tag som en JSON string. Eksempel:
```html
<div data-frigg-gtm-product='{"id": "123", "name": "Løve", "price": "100.00", "brand": "Afrika", "category": "Dyr", "variant": "Hann", "list": "Produktsøk"}'>
</div>
```

### Debugging ###
Ved å legge til debug parameter i url (eks www.sdf.sdf?debug) vil det dukke opp logger i console. I tillegg vil eventCallback ikke bli utført.

### ProductImpression ###
Eksempel på hvordan dette kan settes opp. "selector" er da måten elementet hentes på i JQuery. Produktet settes også opp i en data-tag som er definert i hovedoppsettet.
```html
<div data-frigg-gtm-impression data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": "", "list": "Produktsøk"}'>
</div>
```

### ProductDetail ###
Legges på produktet, registrerer "productView" inne på et produkt.
Samme 
```html
<div data-frigg-gtm-detail data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": "", "list": "Produktsøk"}'>
</div>
```

Scriptet kan enten legges på produktInnlegg-malen eller i master malen.
```html
<script>
    friggTagManager.measureProductDetailView({selector: '[data-frigg-gtm-detail]'});
</script>
```

### Parametere til klikk-eventer ###
For klikk eventer må man alltid legge til et objekt som inneholder den dataen man trenger
Name|HTML Type|Required|Description
--- | --- | --- | ---
element | `Alle` | Ja | Elementet der JSON-produktdata-tagen befinner seg. Hvis produkt-data befinner seg i anchor-elementet så spesifiseres kun denne.
anchorElement | `<a>` | Nei | Hvis element ikke er anchor elementet men kun inneholder produkt-data må også anchorElement legges til
quantityElement | `<input>` | Nei | **Kun legg til /fjern fra handlevogn!** Input elementet der antall settes. Hvis elementet mangler, eller value ikke kan finnes så settes antall automatisk til 1.

Dersom verken element eller anchorElement har href satt opp, vil det ikke være noe redirekt.

Eksempel: 
```javascript
friggTagManagerEcommerce.measureRemoveProductFromCart({
    element: $('#single-product-item')[0], 
    anchorElement: this, 
    quantityElement: $('#single-product-item').find('input.quantity')[0]
});
```

### ProductClick ###
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```html
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureProductClick({element: this.parentElement, anchorElement: this})">
    </a>
</div>
```

### ProductAddToCart ##
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```html
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureaddProductToCart({element: this.parentElement, anchorElement: this, quantityElement: this.parentElement.children[2]})">
    </a>
</div>
```

### ProductRemoveFromCart ###
Klikk-event som legges på elementet. onclick returnerer alltid false, href-url kjøres i eventCallback fra GTM. 

```html
<div data-frigg-gtm-product='{"id": "{content:default_productno}", "name": "{content:default_title}", "price": "{insert:netpricecleanhtml}", "brand": "", "category": "", "variant": ""'>
    <a href="/produkt/123" title="{content:default_title?length=60}" onclick="return friggTagManagerEcommerce.measureRemoveProductFromCart({element: this.parentElement, anchorElement: this, quantityElement: this.parentElement.children[1]});">
    </a>
</div>
```

## Oppsett i Google Tag Manager og Google Analytics ##
Dette må legges inn for at GTM-koden skal registreres av Enhanced Ecommerce i Analytics

### Oppsett av Enhanced Ecommerce I Google Analytics ###
Oppsettet må være likt som på bildet. Legg merke til "Checkout Labeling", disse må matche for at checkout skal fungere.

![alt-text](https://image.ibb.co/euT9tm/enhanced_ecommerce_google_settings.png)

### Oppsett av Enhanced Ecommerce I Google Tag Manager ###


Slik settes opp alt fra "scratch"
1. Sett opp Google Analytics -variabel hvis den ikke finnes. Dette for å koble GTM mot Analytics kontoen.     
![alt-text](https://image.prntscr.com/image/CzB_5N6QQv28GQs8aOYQHw.png)   
2. Sett opp en "Egendefinert Event" i tagManager som heter "friggUpdate" ![](https://image.prntscr.com/image/LXVEnsLJTbWHHjP9kVh5aw.png)
3. Sett opp Tag med type "Universal Analytics". Universal Analytics må deretter settes opp med 2 triggere, page view og custom event "friggUpdate".
![alt-text](https://image.prntscr.com/image/6tvbYbz2Q7_jBn1r2Wzy2Q.png)
4. Sette opp event "transactionEvent" på samme måte som "friggUpdate".
5. Sette opp Purchase-tag for Enhanced Ecommerce transaksjoner med utløser (trigger) "transactionEvent".
![alt-text](https://image.prntscr.com/image/IZMtLl8VSSOeX2ZzPli4kg.png)



