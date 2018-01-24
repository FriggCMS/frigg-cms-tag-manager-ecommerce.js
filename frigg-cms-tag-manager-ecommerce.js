/**
 * For  Google Tag Manager - Enhanced Ecommerce functionality
 * Uses window.dataLayer to store data.
 * 
 */
(function(window, $){

    //#region Private properties
    // Set when datalayer is initalized
    var _dataLayerIsInitiated = false;

    // Set when ecommerce property is initialized.
    var _ecommerceIsInitiated = false;

    // The index of the ecommerce property on datalayer.
    var _dataLayerEcommerceIndex = 0;

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
        measureCheckoutStep: measureCheckoutStep,

        /**
         * @param {string} config.currencyCode The ISO currency code, e.g. 'NOK'
         */
        initiateDataLayerWithEcommerce: initiateDataLayerWithEcommerce
    };
    window.friggTagManagerEcommerce = window.friggTagManager;

    //#region Public functions
    function measureProductImpressions (config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        initateProductImpressionsOnDataLayer();

        $(config.selector).each(function(index){
            var data = this.dataset;

            var product = getCleanImpressionProduct(JSON.parse(data[config.productData || _config.productData]), index);
            // Updates position
            data[config.productData || _config.productData] = JSON.stringify(product);

            addProductToImpression(product);
        });
    };

    function measureProductDetailView(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        initiateProductDetailPropertyOnDataLayer();

        $(config.selector).each(function(index){
            var data = this.dataset;

             var product = getCleanImpressionProduct(JSON.parse(data[config.productData || _config.productData]), index);
             // Updates position
             data[config.productData || _config.productData] = JSON.stringify(product);

             addProductToDetail(product)
        });
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
                    'products': [product]
                }
            }
        });
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
        }, config.anchorElement !== undefined ? config.anchorElement.href : config.element.href);

        return false;
    }
    function measureCheckoutStep(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        throw 'Not implemented';
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
        initiateEcommercePropertyOnDataLayer(config);
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
     * Initiate ecommerce property
     */
    function initiateEcommercePropertyOnDataLayer(config){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        if(!_ecommerceIsInitiated){
            _dataLayerEcommerceIndex = window.dataLayer.length;
            window.dataLayer.push({
                'ecommerce': {
                    'currencyCode': config.currencyCode, // Local currency is optional.
                }
            });
            _ecommerceIsInitiated = true;
        }
        else {
            console.warn('Ecommerce property trying to be initialied more than once.');
        }
    }

    /**
     * Pushes object onto dataLayer-array.
     * Redirects to url if exists on eventCallback
     * 
     * @param {object} obj The object to be pushed
     * @param {string} eventCallbackUrl Url to go to on eventCallback. If empty then no location change.
     */
    function pushObjectToDataLayer(obj, eventCallbackUrl){
        obj.eventCallback = function(){
            _log('%c eventCallback, url:' + eventCallbackUrl || '(none)', getFunctionStyle(), obj);
            if(_debug) return;
            if(eventCallbackUrl){
                document.location = eventCallbackUrl;
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
     * For cats etc. 
     * Docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#product-data
     * @param {object} product 
     */
    function getCleanCartProduct(product, index){
        return getCleanImpressionProduct(product, index);
    }

    /**
     * Initiates productImpression
     * @param {string} currencyCode ISO currencyCode, is optional according to google documentation.
     */
    function initateProductImpressionsOnDataLayer(currencyCode){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        window.dataLayer[_dataLayerEcommerceIndex].ecommerce.impressions = [];
    }


    /**
     * Adds product data object to dataLayer.ecommerce.impressions
     * @param {object} product Product data
     */
    function addProductToImpression(product){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        window.dataLayer[_dataLayerEcommerceIndex].ecommerce.impressions.push(product);
    }

    /**
     * Initiates dataLayer.ecommerce with detail object.
     */
    function initiateProductDetailPropertyOnDataLayer(){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        window.dataLayer[_dataLayerEcommerceIndex].ecommerce.detail = {
            products: []
        };
    }

    /**
     * Adds product data object to dataLayer.commerce.details.products
     * @param {object} product Product data
     */
    function addProductToDetail(product){
        _log(getFunctionName(arguments), getFunctionStyle(), arguments);
        window.dataLayer[_dataLayerEcommerceIndex].ecommerce.detail.products.push(product);
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