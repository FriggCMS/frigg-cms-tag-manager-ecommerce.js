/**
 * For  Google Tag Manager - Enhanced Ecommerce functionality
 * Uses window.dataLayer to store data.
 * 
 */
(function(window, $){

    //#region Private properties
    // Set when datalayer is initalized
    var _dataLayerIsInitiated = false;

    // Init config.
    var _config = null;

    // Is debug
    var _debug = window.location.search.indexOf('debug') !== -1;

    // For logging
    var _log;

    // Initiate log
    if(_debug){
        _log = console.log.bind(console);
    }
    else {
        // Dummy
        _log = function(){}
    }
    //#endregion

    /**
     * Global variable
     */
    window.friggTagManager = {
        /**
         * Measure product impression for multipe products at the same time. It can be for example productList, productSearch, relatedProducts.
         * 
         * Google doc: https://developers.google.com/tag-manager/enhanced-ecommerce#product-impressions
         * 
         * @param {object} config The config
         * @param {string} config.selector The selector to identity impression elements
         * @param {string} config.productData The Product data JSON property, e.g if data-frigg-gtm-product, then put 'friggGtmProduct' 
         * @param {string} config.currencyCode The ISO currency code, e.g. 'NOK'
         */
        measureProductImpressions: measureProductImpressions,

        /**
         * Registeres single product view.
         * Will initiate dataLayer-array if NULL or empty
         * 
         * Google doc: https://developers.google.com/tag-manager/enhanced-ecommerce#details
         * 
         * @param {object} config The config
         * @param {string} config.selector The selector to identity impression elements
         * @param {string} config.productData The Product data JSON property, e.g if data-frigg-gtm-product, then put 'friggGtmProduct' 
         */
        measureProductDetailView: measureProductDetailView,

        /**
         * On click product event, like in productlist or productsearchlist.
         * 
         * @param {object} config The config
         * @param {element} config.element The element containing the product-data
         * @param {element} config.anchorElement If element is not the anchor element that contains the href, it should be provided here.
         */
        measureProductClick: measureProductClick,

        /**
         * Onclick event
         * 
         * @param {object} config
         * @param {element} config.element The element containing the product-data.
         */
        measureaddProductToCart: measureaddProductToCart,
        measureRemoveProductFromCart: measureRemoveProductFromCart,

        /**
         * @param {string} config.currencyCode The ISO currency code, e.g. 'NOK'
         */
        initiateDataLayerWithEcommerce: initiateDataLayerWithEcommerce
    };
    window.friggTagManagerEcommerce = window.friggTagManager;

    /**
     * Initiated by Frigg Checkout process
     * @param {number} step The step index, starts with 1
     * @param {string} description Description of checkout step
     */
    window.checkoutStep = function(step, description){
        $(function(){
            _log(getFunctionName(arguments), getFunctionStyle(), arguments);
            var gtmProducts = convertToGtmProducts(window.checkoutProducts);

            pushObjectToDataLayer({
                'event': 'checkout',
                'ecommerce': {
                  'checkout': {
                    'actionField': {'step': step, 'option': description},
                    'products': gtmProducts
                 }
               }
            });

            updateAfterClick();
        });
    };

    function convertToGtmProducts(products){
        var gtmProducts = [];
        for(var i in products){
            var product = products[i];
            gtmProducts.push({
                'name': product.Description,
                'id': product.ProductNo,
                'price': product.TotalDecimalAutoVat,
                'brand': '',
                'category': product.CategoryName,
                'variant': '',
                'quantity': product.Quantity
            });
        }

        return gtmProducts;
    }

    /**
     * Updates after click event by firing custom event to GTM.
     * Should not be used for page views
     */
    function updateAfterClick(){
        dataLayer.push({event: 'friggUpdate'});
    }

    //#region Public functions
    function measureProductImpressions (config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);

        var products = [];
        $(config.selector).each(function(index){
            var data = this.dataset;

            var product = getCleanImpressionProduct(JSON.parse(data[config.productData || _config.productData]), index);
            products.push(product);
            // Updates position
            data[config.productData || _config.productData] = JSON.stringify(product);
        });

        if(products.length === 0) return;

        // We split up products if more than 20 to avoid maxBytes error from analytics (8kb maxLimit)
        var maxLimit = 20;
        if(products.length > maxLimit){
            while (products.length > 0){
                var p1 = products.splice(0, maxLimit);

                pushProductImpressions(p1);
            }
        }
        else {
            pushProductImpressions(products);
        }

        function pushProductImpressions(p){
            pushObjectToDataLayer({
                'ecommerce': {
                    'currencyCode': _config.currencyCode,
                    'impressions': p
                }
            });

            updateAfterClick();
        }
    };

    function measureProductDetailView(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);

        var products = [];
        $(config.selector).each(function(index){
            var data = this.dataset;

             var product = getCleanImpressionProduct(JSON.parse(data[config.productData || _config.productData]), index);
             products.push(product);
             // Updates position
             data[config.productData || _config.productData] = JSON.stringify(product);
        });

        if(products.length === 0) return;
        
        pushObjectToDataLayer({
            'ecommerce': {
                'detail': {
                    'actionField': {'list': products[0].list},
                    'products': products
                }
            }
        });    
     
        updateAfterClick();
    }

    function measureProductClick(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);

        var element = config.element;
        var anchorElement = config.anchorElement;
        var data = element.dataset;

        var url;
        if(anchorElement !== undefined){
            url = anchorElement.href;
        }
        else {
            url = element.href;
        }

        if(!url){
            console.error('No URL found for callback, deactivating GMT productClick! The Url should either be spesified in the anchor element either in the first or second argument.');
            return true;
        }

        var product = getCleanImpressionProduct(JSON.parse(data[_config.productData]), 0);
        
        pushObjectToDataLayer({
            'event': 'productClick',
            'ecommerce': {
                'click': {
                    'actionField': {
                        'list': product.list
                    },
                    'products': [product]
                }
            }
        }, url);

        updateAfterClick();
        
        return false;
    }
    function measureaddProductToCart(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);

        var product = getProductDataFromCleanElement(config.element);

        setProductQuantityIfExists(product, config.quantityElement);

        pushObjectToDataLayer({
            'event': 'addToCart',
            'ecommerce': {
                'currencyCode': _config.currencyCode,
                'add': {
                    'actionField': {
                        'list': product.list
                    },
                    'products': [product]
                }
            }
        });

        updateAfterClick();
    }

    function measureRemoveProductFromCart(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);

        var product = getProductDataFromCleanElement(config.element);

        setProductQuantityIfExists(product, config.quantityElement);

        // Measure the removal of a product from a shopping cart.
        pushObjectToDataLayer({
            'event': 'removeFromCart',
            'ecommerce': {
                'remove': {                          
                    'products': [product]
                }
            }
        }, config.anchorElement !== undefined ? config.anchorElement.href : config.element.href, true);

        updateAfterClick();

        return false;
    }
    //#endregion

    //#region Private functions

    /**
     * Initiates both dataLayer and ecommerce object.
     * Basically the constructor.
     * 
     * @param {object} config Global config, is available for other
     */
    function initiateDataLayerWithEcommerce(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        _config = config;
        initiateDataLayer();
    }

     /**
     * Initiate datalayer
     */
    function initiateDataLayer(){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        if(!_dataLayerIsInitiated){
            window.dataLayer = window.dataLayer || [];
            _dataLayerIsInitiated = true;
        }
        else {
            console.warn('Datalayer trying to be initialied more than once.');
        }
    }

    /**
     * Pushes object onto dataLayer-array.
     * Redirects to url if exists on eventCallback
     * 
     * @param {object} obj The object to be pushed
     * @param {string} eventCallbackUrl Url to go to on eventCallback. If empty then no location change.
     * @param {bool} eventCallbackUrlAsAjax - Set to true if eventCallbackUrl should be run as callback.
     */
    function pushObjectToDataLayer(obj, eventCallbackUrl, eventCallbackUrlAsAjax){
        obj.eventCallback = function(){
            _log('%c eventCallback, url:' + eventCallbackUrl || '(none)', getFunctionStyle(), obj);
            if(_debug) return;
            if(eventCallbackUrl){
                if(eventCallbackUrlAsAjax){
                    $.get(eventCallbackUrl).then(function(){
                        document.location = eventCallbackUrl;
                    });
                }
                else {
                    document.location = eventCallbackUrl;
                }
            }
        };

        window.dataLayer.push(obj);
    }

    /**
     * Validates impression product and fixes it. Impression product are a product that is viewed.
     * Docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#impression-data
     * @param {object} product Analytics product
     * @param {number} index Index of product
     */
    function getCleanImpressionProduct(product, index){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        if(!product.name && !product.id) throw 'product name or id is always required!';
        if(isNaN(index)) throw 'Missing valid index';

        // Replace , with . if exists
        if(typeof product.price === 'string' && product.price.indexOf(',') !== -1){
            product.price = product.price.replace(',', '.');
        }

       // // Position starts at 1
        product.position = index+1;

        return product;
    }

    /**
     * Gets the product JSON data from the element, and returns it as object.
     * Assumes the product has already been cleaned.
     * @param {element} element 
     */
    function getProductDataFromCleanElement(element){
        var data = element.dataset;

        return JSON.parse(data[_config.productData]);
    }


    /**
     * Checks element for quantity and sets it.
     * 
     * @param {object} product Productdata
     * @param {element} quantityElement quantity element
     */
    function setProductQuantityIfExists(product, quantityElement){
        product.quantity = 1;
        if(quantityElement !== undefined){
            var value = quantityElement.value;

            if(value != null){
                if(!isNaN(value)){
                    product.quantity = parseInt(quantityElement.value);
                }
            }
            else {
                console.warn('Cant find product quantity value!');
            }
        }
    }

    /**
     * Logging purposes. Needed for styling console.log
     * @param {Array<object>} args Function arguments
     */
    function getFunctionName(args){
        return '%c' + args.callee.name;
    }

    /**
     * Logging purposes. Add style to console.log
     */
    function getFunctionStyle(){
        return 'background: #222; color: #bada55'
    }

    //#endregion
})(window, $);