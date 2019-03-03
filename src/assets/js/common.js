// polyfill for 'closest()' to support IE9+
// reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

var SUPER = {};

// reCaptcha
SUPER.reCaptchaScriptLoaded = false;
SUPER.reCaptchaverifyCallback = function(response){
    var $ = jQuery;
    $.ajax({
        type: 'post',
        url: super_common_i18n.ajaxurl,
        data: {
            action: 'super_verify_recaptcha',
            response: response,
        },
        success: function (data) {
            if(data==1){
                $('.super-recaptcha').children('p').remove(); // Fast remove
                $('.super-recaptcha').attr('data-verified',1);
                $('.super-recaptcha').removeClass('error-active');
            }else{
                $('.super-recaptcha').attr('data-verified',0);
            }
        }
    }); 
}
function SUPERreCaptchaRender(){
    var $ = jQuery;
    $('.super-shortcode.super-field.super-recaptcha:not(.super-rendered)').each(function(){
        var $this = $(this);
        var $element = $this.find('.super-recaptcha');
        var $form = $this.parents('.super-form:eq(0)');
        var $form_id = $form.find('input[name="hidden_form_id"]').val();
        $element.attr('data-form',$form_id);
        $element.attr('id','super-recaptcha-'+$form_id);
        if($form.length==0){
            $this.html('<i>reCAPTCHA will only be generated and visible in the Preview or Front-end</i>');  
        }
        if($this.data('key')==''){
            $this.html('<i>reCAPTCHA API key and secret are empty, please navigate to:<br />Super Forms > Settings > Form Settings and fill out your reCAPTCHA API key and secret</i>');  
        }else{
            if(typeof $form_id !== 'undefined'){
                var checkExist = setInterval(function() {
                    if( (typeof grecaptcha !== 'undefined') && (typeof grecaptcha.render !== 'undefined') ) {
                        clearInterval(checkExist);
                        $this.addClass('super-rendered');
                        var widgetId = grecaptcha.render('super-recaptcha-'+$form_id, {
                            'sitekey' : $element.data('key'),
                            'callback' : SUPER.reCaptchaverifyCallback,
                            'theme' : 'light'
                        });
                    }
                }, 100);
            }
        }
    });
}
function SUPERreCaptcha(){
    var $ = jQuery;
    // Load recaptcha api manually if theme uses ajax requests
    if($('.super-shortcode.super-field.super-recaptcha:not(.super-rendered)').length){
        if( (typeof grecaptcha === 'undefined') || (typeof grecaptcha.render === 'undefined') ) {
            if(!SUPER.reCaptchaScriptLoaded){
                $.getScript( 'https://www.google.com/recaptcha/api.js?onload=SUPERreCaptcha&render=explicit', function( data, textStatus, jqxhr ) {
                    SUPER.reCaptchaScriptLoaded = true;
                    SUPERreCaptchaRender();
                });
            }
        }else{
            if(!SUPER.reCaptchaScriptLoaded){
                SUPER.reCaptchaScriptLoaded = true;
                SUPERreCaptchaRender();
            }
        }
    }
}

(function($) {

    if(typeof super_common_i18n.ajaxurl === 'undefined'){
        super_common_i18n.duration = 500;
        super_common_i18n.ajaxurl = ajaxurl;
    }

    SUPER.debug_time = function($name){
        console.time($name);
    }
    SUPER.debug_time_end = function($name){
        console.timeEnd($name);
    }
    SUPER.debug = function($log){
        //console.log($log);
    }

    // Get/Set session data based on pointer
    SUPER.get_session_pointer = function(key){
        function getUrlVars() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                vars[key] = value;
            });
            return vars;
        }
        function getUrlParam(parameter, defaultvalue){
            var urlparameter = defaultvalue;
            if(window.location.href.indexOf(parameter) > -1){
                urlparameter = getUrlVars()[parameter];
                }
            return urlparameter;
        }
        return key+'_'+getUrlParam('id', 0);
    }
    SUPER.set_session_data = function(key, data, method){
        if(typeof method === 'undefined') method = 'local';
        if(method==='local'){
            localStorage.setItem(SUPER.get_session_pointer(key), data);
        }else{
            sessionStorage.setItem(SUPER.get_session_pointer(key), data);
        }
    }
    SUPER.get_session_data = function(key, method){
        if(typeof method === 'undefined') method = 'local';
        if(method==='local'){
            return localStorage.getItem(SUPER.get_session_pointer(key));
        }else{
            return sessionStorage.getItem(SUPER.get_session_pointer(key));
        }
    }

    // Barcode generator
    SUPER.generateBarcode = function(){
        $('.super-barcode').each(function(){
            var $this = $(this).find('input');
            var $renderer = 'css';
            var $barcode = $this.val();
            var $barcodetype = $this.data('barcodetype');
            var $background = $this.data('background');
            var $barcolor = $this.data('barcolor');
            var $barwidth = $this.data('barwidth');
            var $barheight = $this.data('barheight');
            var $modulesize = $this.data('modulesize');
            var $rectangular = $this.data('rectangular');
            var $quietzone = false;
            if ($this.data('quietzone')==1) $quietzone = true;
            var $settings = {
                output:$renderer,
                bgColor: $background,
                color: $barcolor,
                barWidth: $barwidth,
                barHeight: $barheight,
                moduleSize: $modulesize,
                addQuietZone: $quietzone
            };
            if($rectangular==1){
                $barcode = {code:$barcode, rect:true};
            }
            $this.parent().find('.super-barcode-target').barcode($barcode, $barcodetype, $settings);
        });
    }

    // init Rating
    SUPER.rating = function(){
        $('.super-rating').on('mouseleave',function(){
            $(this).find('.super-rating-star').removeClass('active');
        });
        $('.super-rating-star').on('click',function(){
            $(this).parent().find('.super-rating-star').removeClass('super-active');
            $(this).addClass('super-active');
            $(this).prevAll('.super-rating-star').addClass('super-active');
            var $rating = $(this).index()+1;
            $(this).parent().find('input').val($rating);
            SUPER.after_field_change_blur_hook($(this).parent().find('input'));
        });
        $('.super-rating-star').on('mouseover',function(){
            $(this).parent().find('.super-rating-star').removeClass('active');
            $(this).addClass('active');
            $(this).prevAll('.super-rating-star').addClass('active');
        });
    }


    // @since 2.3.0 - init file upload fields
    SUPER.init_fileupload_fields = function(){
        $('.super-fileupload:not(.super-rendered)').each(function() {
            $(this).addClass('super-rendered');
            $(this).fileupload({
                filesContainer : $(this).find(".super-fileupload-files"),
                dropZone : $(this).parent('.super-field-wrapper'),
                add: function(e, data) {
                    var uploadErrors = [];
                    if(data.originalFiles[0]['size'] > ($(this).data('file-size')*1000000) ) {
                        $(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files').children('div[data-name="'+data.originalFiles[0]['name']+'"]').remove();
                        uploadErrors.push(super_common_i18n.errors.file_upload.filesize_too_big);
                    }
                    if(uploadErrors.length > 0) {
                        alert(uploadErrors.join("\n"));
                    }
                },
                dataType: 'json',
                autoUpload: false,
                //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i, //Allow these file extensions with SUPER
                maxFileSize: $(this).data('file-size')*1000000, // 5 MB
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $(this).parent().children('.super-progress-bar').css('display','block').css('width', progress + '%');
                }        
            }).on('fileuploaddone', function (e, data) {
                $.each(data.result.files, function (index, file) {
                    if (file.error) {
                        var error = $('<span class="super-error"/>').text(' ('+file.error+')');
                        $(data.context.children()[index]).children('.super-error').remove();
                        $(data.context.children()[index]).append(error);
                        $(data.context.children()[index]).parent('div').addClass('error');
                    }else{
                        $(data.context).addClass('super-uploaded');
                        data.context.attr('data-name',file.name).attr('data-url',file.url).attr('data-thumburl',file.thumbnailUrl);
                    }
                });
            }).on('fileuploadadd', function (e, data) {
                $(this).removeClass('finished');
                $(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files > div.error').remove();
                data.context = $('<div/>').appendTo($(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files'));
                var el = $(this);
                var accepted_file_types = el.data('accept-file-types');
                var file_types_object = accepted_file_types.split('|');

                // @since 4.4.0 - Upload limitation for all files combined
                var upload_limit = $(this).data('upload-limit')*1000000; // e.g: 20 MB

                $.each(data.files, function (index, file) {
                    var total = el.data('total-file-sizes');
                    if(typeof total === 'undefined'){
                        total = file.size;
                    }else{
                        total = total+file.size;
                    }
                    if( (total>upload_limit) && (upload_limit!=0) ) {
                        alert(super_common_i18n.errors.file_upload.upload_limit_reached);
                    }else{
                        var ext = file.name.split('.').pop();
                        if( (file_types_object.indexOf(ext)!=-1) || (accepted_file_types=='') ) {
                            el.data('total-file-sizes', total);
                            data.context.parent('div').children('div[data-name="'+file.name+'"]').remove();
                            data.context.data(data).attr('data-name',file.name).html('<span class="super-fileupload-name">'+file.name+'</span><span class="super-fileupload-delete">[x]</span>');
                            data.context.data('file-size',file.size);
                        }else{
                            data.context.remove();
                            alert(super_common_i18n.errors.file_upload.incorrect_file_extension);
                        }
                    }
                });
            }).on('fileuploadprocessalways', function (e, data) {
                var index = data.index;
                var file = data.files[index];
                if (file.error) {
                    $(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files').find("[data-name='" + file.name + "']").remove();
                    alert(file.error);
                }
            }).on('fileuploadfail', function (e, data) {
                $.each(data.files, function (index, file) {
                    var error = $('<span class="super-error"/>').text(' (file upload failed)');
                    $(data.context.children()[index]).children('.super-error').remove();
                    $(data.context.children()[index]).append(error);
                });
            }).on('fileuploadsubmit', function (e, data) {
                data.formData = {
                    'accept_file_types': $(this).data('accept-file-types'),
                    'max_file_size': $(this).data('file-size')*1000000,
                };
            });
        });
    }

    // @since 3.5.0 - calculate distance (google)
    var distance_calculator_timeout = null; 
    SUPER.calculate_distance = function( $this ) {
        if($this.hasClass('super-distance-calculator')){
            var $form = $this.parents('.super-form:eq(0)');
            var $method = $this.data('distance-method');
            if($method=='start'){
                var $origin_field = $this;
                var $origin = $this.val();
                var $destination = $this.data('distance-destination');
                if($form.find('.super-shortcode-field[name="'+$destination+'"]').length){
                    var $destination_field = $form.find('.super-shortcode-field[name="'+$destination+'"]');
                    var $destination = $destination_field.val();
                }
            }else{
                var $origin_field = $form.find('.super-shortcode-field[name="'+$this.data('distance-start')+'"]');
                var $origin = $origin_field.val();
                var $destination_field = $this;
                var $destination = $this.val();
            }
            var $value = $origin_field.data('distance-value');
            var $units = $origin_field.data('distance-units');
            if($value!='dis_text'){
                var $units = 'metric';
            }
            if( ($origin=='') || ($destination=='') ) {
                return true;
            }
            if(distance_calculator_timeout !== null){
                clearTimeout(distance_calculator_timeout);
            }
            distance_calculator_timeout = setTimeout(function () {
                $this.parents('.super-field-wrapper:eq(0)').addClass('super-calculating-distance');
                $.ajax({
                    url: super_common_i18n.ajaxurl,
                    type: 'post',
                    data: {
                        action: 'super_calculate_distance',
                        units: $units,
                        origin: $origin,
                        destination: $destination
                    },
                    success: function (result) {
                        var $result = jQuery.parseJSON(result);
                        if($result.status=='OK'){
                            var $leg = $result.routes[0].legs[0];
                            var $field = $origin_field.data('distance-field');

                            // distance  - Distance in meters
                            if( $value=='distance' ) {
                                var $calculation_value = $leg.distance.value
                            }
                            // dis_text  - Distance text in km or miles
                            if( $value=='dis_text' ) {
                                var $calculation_value = $leg.distance.text
                            }

                            // duration  - Duration in seconds
                            if( $value=='duration' ) {
                                var $calculation_value = $leg.duration.value
                            }
                            // dur_text  - Duration text in minutes
                            if( $value=='dur_text' ) {
                                var $calculation_value = $leg.duration.text
                            }
                            
                            var $field = $form.find('.super-shortcode-field[name="'+$field+'"]');
                            $field.val($calculation_value);
                            SUPER.after_field_change_blur_hook($field);
                            SUPER.init_replace_html_tags();
                        }else{
                            if($result.status=='ZERO_RESULTS'){
                                var $alert_msg = super_common_i18n.errors.distance_calculator.zero_results;
                            }else{
                                if($result.status=='OVER_QUERY_LIMIT'){
                                    var $alert_msg = $result.error_message;
                                }else{
                                    var $alert_msg = super_common_i18n.errors.distance_calculator.error;
                                }
                            }
                            $('.super-msg').remove();
                            var $result = jQuery.parseJSON(result);
                            var $html = '<div class="super-msg super-error">';                            
                            $origin_field.blur();
                            if(typeof $destination_field !== 'undefined') $destination_field.blur();
                            $html += $alert_msg;
                            $html += '<span class="close"></span>';
                            $html += '</div>';
                            $($html).prependTo($form);
                            $('html, body').animate({
                                scrollTop: $form.offset().top-200
                            }, 1000);
                        }
                    },
                    complete: function(){
                        $this.parents('.super-field-wrapper:eq(0)').removeClass('super-calculating-distance');
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr, ajaxOptions, thrownError);
                        alert('Failed to process data, please try again');
                    }
                });
            }, 1000);
        }
    }


    // Handle Conditional logic
    SUPER.conditional_logic = function($changed_field, $form){
        if(typeof $form === 'undefined'){
            var $form = SUPER.get_frontend_or_backend_form();
        }
        // @since 3.7.0 - check if we need to change the $form element to the form level instead of multi-part level
        if($form.hasClass('super-multipart')){
            var $form = $form.parents('.super-form:eq(0)');
        }
        if(typeof $changed_field !== 'undefined'){
            if(!$form[0]) $form = SUPER.get_frontend_or_backend_form();
            var $conditional_logic = $form[0].querySelectorAll('.super-conditional-logic[data-fields*="['+$changed_field.attr('name')+']"]');
            var $conditional_logic_with_tags = $form[0].querySelectorAll('.super-conditional-logic[data-tags*="['+$changed_field.attr('name')+']"]');
        }else{
            if(!$form[0]) $form = SUPER.get_frontend_or_backend_form();
            var $conditional_logic = $form[0].querySelectorAll('.super-conditional-logic');
        }
        var $did_loop = false;
        if(typeof $conditional_logic !== 'undefined'){
            if($conditional_logic.length!=0){
                $did_loop = true;
                SUPER.conditional_logic.loop($changed_field, $form, $conditional_logic);
            }
        }
        if(typeof $conditional_logic_with_tags !== 'undefined'){
            if($conditional_logic_with_tags.length!=0){
                $did_loop = true;
                SUPER.conditional_logic.loop($changed_field, $form, $conditional_logic_with_tags);
            }
        }
        // Make sure that we still update variable fields based on changed field.
        if( $did_loop==false ) {
            SUPER.update_variable_fields($changed_field, $form);
        }
    }

    // @since 3.6.0 - always make sure to return the value of the field in case it uses advanced tags like function like: value;value2
    // Also make sure to return multiple values in case of dropdown/checkbox or other multi value elements
    // Function to return the dynamic tag value based on conditions field check
    SUPER.return_dynamic_tag_value = function($parent, $value){
        if( typeof $value === 'undefined' ) return '';
        if( $value=='' ) return $value;
        if( (typeof $parent !== 'undefined') && ( ($parent.hasClass('super-dropdown')) || ($parent.hasClass('super-checkbox')) || ($parent.hasClass('super-countries')) ) ) {
            var $values = $value.toString().split(',');
            var $new_values = '';
            $.each($values, function( index, value ) {
                var $value = value.toString().split(';');
                $value = $value[0];
                if($new_values==''){
                    $new_values += $value;
                }else{
                    $new_values += ','+$value;
                }
            });
            $value = $new_values;
        }else{
            var $value = $value.toString().split(';');
            $value = $value[0];      
        }
        return $value;
    }

    SUPER.conditional_logic.match_found = function($counter, v, $shortcode_field_value, $shortcode_field_and_value, $parent){
        var $i = 0;
        switch(v.logic) {
          case 'equal':
            if( v.value==$shortcode_field_value ) $i++;
            break;
          case 'not_equal':
            if( v.value!=$shortcode_field_value ) $i++;
            break;
          case 'greater_than':
            if( parseFloat($shortcode_field_value)>parseFloat(v.value) ) $i++;
            break;
          case 'less_than':
            if( parseFloat($shortcode_field_value)<parseFloat(v.value) ) $i++;
            break;
          case 'greater_than_or_equal':
            if( parseFloat($shortcode_field_value)>=parseFloat(v.value) ) $i++;
            break;
          case 'less_than_or_equal':
            if( parseFloat($shortcode_field_value)<=parseFloat(v.value) ) $i++;
            break;
          case 'contains':
            if( $parent.classList.contains('super-checkbox') || $parent.classList.contains('super-radio') || $parent.classList.contains('super-dropdown') || $parent.classList.contains('super-countries') ) {
                var $checked = $shortcode_field_value.split(',');
                var $string_value = v.value.toString();
                Object.keys($checked).forEach(function(key) {
                    if( $checked[key].indexOf($string_value) >= 0) {
                        $i++;
                        return false
                    }
                });
            }else{
                // If other field
                if( $shortcode_field_value.indexOf(v.value) >= 0) $i++;
            }
            break;
          default:
            // code block
        }
        if( v.and_method!='' ) {
            switch(v.logic_and) {
              case 'equal':
                if( v.value_and==$shortcode_field_and_value ) $i++;
                break;
              case 'not_equal':
                if( v.value_and!=$shortcode_field_and_value ) $i++;
                break;
              case 'greater_than':
                if( parseFloat($shortcode_field_and_value)>parseFloat(v.value_and) ) $i++;
                break;
              case 'less_than':
                if( parseFloat($shortcode_field_and_value)<parseFloat(v.value_and) ) $i++;
                break;
              case 'greater_than_or_equal':
                if( parseFloat($shortcode_field_and_value)>=parseFloat(v.value_and) ) $i++;
                break;
              case 'less_than_or_equal':
                if( parseFloat($shortcode_field_and_value)<=parseFloat(v.value_and) ) $i++;
                break;
              case 'contains':
                if( $parent.classList.contains('super-checkbox') || $parent.classList.contains('super-radio') || $parent.classList.contains('super-dropdown') || $parent.classList.contains('super-countries') ) {
                    var $checked = $shortcode_field_and_value.split(',');
                    var $string_value = v.value_and.toString();
                    Object.keys($checked).forEach(function(key) {
                        if( $checked[key].indexOf($string_value) >= 0) {
                            $i++;
                            return false
                        }
                    });
                }else{
                    // If other field
                    if( $shortcode_field_and_value.indexOf(v.value_and) >= 0) $i++;
                }
                break;
              default:
                // code block
            }
            
        }
        if( v.and_method=='and' ) {
            if($i>=2) $counter++;
        }else{
            if($i>=1) $counter++;
        }
        return $counter;
    }
    SUPER.conditional_logic.get_field_value = function($logic, $shortcode_field_value, $shortcode_field, $parent){
        if( $logic=='greater_than' || $logic=='less_than' || $logic=='greater_than_or_equal' || $logic=='less_than_or_equal' ) {
            // Check if dropdown field
            if( $parent.classList.contains('super-dropdown') || $parent.classList.contains('super-countries') ){
                var $sum = 0;
                var $selected = $parent.querySelectorAll('.super-dropdown-ui li.super-active:not(.super-placeholder)');
                Object.keys($selected).forEach(function(key) {
                    $sum += parseFloat($selected[key].dataset['value']);
                });
                $shortcode_field_value = $sum;
            }
            // Check if checkbox field
            if( $parent.classList.contains('super-checkbox') ) {
                var $sum = 0;
                var $checked = $parent.querySelectorAll('.super-active');
                Object.keys($checked).forEach(function(key) {
                    $sum += parseFloat($checked[key].querySelector('input').value);
                });
                $shortcode_field_value = $sum;
            }

            // @since 2.3.0 - compatibility with conditional logic
            // Check if currency field (since Super Forms v2.1)
            if( $parent.classList.contains('super-currency') ) {
                var $value = $shortcode_field.value,
                    $currency = $shortcode_field.dataset['currency'],
                    $format = $shortcode_field.dataset['format'],
                    $decimals = $shortcode_field.dataset['decimals'],
                    $thousand_separator = $shortcode_field.dataset['thousandSeparator'],
                    $decimal_seperator = $shortcode_field.dataset['decimalSeparator'];
                $value = $value.replace($currency, '').replace($format, '');
                $value = $value.split($thousand_separator).join('');
                $value = $value.split($decimal_seperator).join('.');
                $shortcode_field_value = ($value) ? parseFloat($value) : 0;
            }
        }
        return $shortcode_field_value;
    }
    SUPER.conditional_logic.loop = function($changed_field, $form, $conditional_logic){
        var $regular_expression = /\{(.*?)\}/g;
        Object.keys($conditional_logic).forEach(function(key) {
            var $this = $conditional_logic[key],
                $json = $this.value,
                $wrapper = $this.closest('.super-shortcode'),
                $field = $wrapper.querySelector('.super-shortcode-field'),
                $action = $wrapper.dataset['conditional_action'],
                $trigger = $wrapper.dataset['conditional_trigger'];

            if($action){
                if($action!='disabled'){
                    var $conditions = jQuery.parseJSON($json);
                    if($conditions){
                        var $total = 0;
                        var $counter = 0;
                        Object.keys($conditions).forEach(function(key) {
                            var v = $conditions[key];
                            // @since 3.5.0 - make sure {tags} are replaced with the correct field value to check conditional logic
                            v.value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.value);
                            v.value_and = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.value_and);

                            $total++;
                            var $shortcode_field = $form[0].querySelector('.super-shortcode-field[name="'+v.field+'"]');
                            if(!$shortcode_field){
                                return;
                            }
                            var $shortcode_field_value = $shortcode_field.value;
                            var $parent = $shortcode_field.closest('.super-shortcode');
                            if(!$shortcode_field_value) $shortcode_field_value = '';

                            // @since 3.6.0
                            $shortcode_field_value = SUPER.return_dynamic_tag_value($($parent), $shortcode_field_value);

                            var $skip = false;
                            for (var p = $shortcode_field && $shortcode_field.parentElement; p; p = p.parentElement) {
                                if(p.classList.contains('super-column')){
                                    if(p.style.display === 'none'){
                                        $skip = true;
                                    }
                                }
                            }

                            // @since 3.1.0 - only check for and field if and method is set
                            if(v.and_method!=''){ 
                                var $shortcode_field_and = $form[0].querySelector('.super-shortcode-field[name="'+v.field_and+'"]');
                                if($shortcode_field_and){
                                    var $shortcode_field_and_value = $shortcode_field_and.value;

                                    for (var p = $shortcode_field_and && $shortcode_field_and.parentElement; p; p = p.parentElement) {
                                        if(p.classList.contains('super-column')){
                                            if(p.style.display === 'none'){
                                                $skip = true;
                                            }
                                        }
                                    }                                

                                    var $parent_and = $shortcode_field_and.closest('.super-shortcode');
                                    if( $parent_and.style.display==='none' && !$parent_and.classList.contains('super-hidden') ) $skip = true;

                                    // @since 3.6.0
                                    $shortcode_field_and_value = SUPER.return_dynamic_tag_value($($parent_and), $shortcode_field_and_value);
                                }

                            }
                            if(!$shortcode_field_and_value) $shortcode_field_and_value = '';


                            var $parent = $shortcode_field.closest('.super-shortcode');
                            if( $parent.style.display==='none' && !$parent.classList.contains('super-hidden') ) $skip = true;
                            
                            if( $skip==true ) {
                                // Exclude conditionally
                            }else{
                                // Generate correct value before checking conditional logic
                                $shortcode_field_value = SUPER.conditional_logic.get_field_value(v.logic, $shortcode_field_value, $shortcode_field, $parent);
                                // Generate correct and value before checking conditional logic
                                if(v.and_method!=''){ 
                                    $shortcode_field_and_value = SUPER.conditional_logic.get_field_value(v.logic_and, $shortcode_field_and_value, $shortcode_field_and, $parent_and);
                                }
                                $counter = SUPER.conditional_logic.match_found($counter, v, $shortcode_field_value, $shortcode_field_and_value, $parent);
                            }
                        });

                        var $hide_wrappers = [];
                        var $show_wrappers = [];
                        var $changed_wrappers = [];
                        if($trigger=='all'){
                            if($counter==$total){
                                if( ($action=='show') && ($wrapper.style.display=='none' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $show_wrappers.push($wrapper);
                                }
                                if( ($action=='hide') && ($wrapper.style.display=='block' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $hide_wrappers.push($wrapper);
                                }
                            }else{
                                if( ($action=='show') && ($wrapper.style.display=='block' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $hide_wrappers.push($wrapper);
                                }
                                if( ($action=='hide') && ($wrapper.style.display=='none' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $show_wrappers.push($wrapper);
                                }
                            }
                        }else{
                            if($counter!=0){
                                if( ($action=='show') && ($wrapper.style.display=='none' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $show_wrappers.push($wrapper);
                                }
                                if( ($action=='hide') && ($wrapper.style.display=='block' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $hide_wrappers.push($wrapper);
                                }
                            }else{
                                if( ($action=='show') && ($wrapper.style.display=='block' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $hide_wrappers.push($wrapper);
                                }
                                if( ($action=='hide') && ($wrapper.style.display=='none' || $wrapper.style.display=='') ){
                                    $changed_wrappers.push($wrapper);
                                    $show_wrappers.push($wrapper);
                                }
                            }
                        }
                        
                        // Hide wrappers
                        Object.keys($hide_wrappers).forEach(function(key) {
                            $hide_wrappers[key].style.display = 'none';
                        });

                        // Show wrappers
                        Object.keys($show_wrappers).forEach(function(key) {
                            $show_wrappers[key].style.display = 'block';
                        });

                        // @since 2.4.0 - call change blur hook on the fields inside the update column
                        Object.keys($changed_wrappers).forEach(function(key) {
                            var $inner = $changed_wrappers[key].querySelectorAll('.super-shortcode-field');
                            Object.keys($inner).forEach(function(key) {
                                var $parent = $inner[key].closest('.super-shortcode');
                                var $element = $parent.querySelector('div[data-fields]');
                                if($element){
                                    var $data_fields = $element.dataset['fields'];
                                    if($data_fields){
                                        $data_fields = $data_fields.split(']');
                                        Object.keys($data_fields).forEach(function(key) {
                                            var v = $data_fields[key];
                                            if(v!=''){
                                                v = v.replace('[','');
                                                var $field = $form[0].querySelector('.super-shortcode-field[name="'+v+'"]');
                                                if($field){
                                                    SUPER.after_field_change_blur_hook($($field), $form, true);
                                                }
                                            }
                                        });
                                    }
                                }
                                var $element = $parent.querySelector('div[data-tags]');
                                if($element){
                                    var $data_fields = $element.dataset['tags'];
                                    if($data_fields){
                                        $data_fields = $data_fields.split(']');
                                        Object.keys($data_fields).forEach(function(key) {
                                            var v = $data_fields[key];
                                            if(v!=''){
                                                v = v.replace('[','');
                                                var $field = $form[0].querySelector('.super-shortcode-field[name="'+v+'"]');
                                                if($field){
                                                    SUPER.after_field_change_blur_hook($($field), $form, true);
                                                }
                                            }
                                        });
                                    }
                                }
                                SUPER.after_field_change_blur_hook($($inner[key]), $form, true);
                            });
                        });

                    }
                }
            }

        });

        // @since 1.4
        SUPER.update_variable_fields($changed_field, $form);

    }

    // @since 1.4 - Update variable fields
    SUPER.update_variable_fields = function($changed_field, $form){
        if(typeof $changed_field !== 'undefined'){
            var $variable_fields = $form.find('.super-variable-conditions[data-fields*="['+$changed_field.attr('name')+']"]');
            var $variable_fields_with_tags = $form.find('.super-variable-conditions[data-tags*="['+$changed_field.attr('name')+']"]');
        }else{
            var $variable_fields = $form.find('.super-variable-conditions');
        }
        if(typeof $variable_fields !== 'undefined'){
            if($variable_fields.length!=0){
                SUPER.update_variable_fields.loop($changed_field, $form, $variable_fields);
            }
        }
        // @since 2.3.0 - let's search for variable fields that contain the field name as a {tag} so we can make sure the correct value will be acquired
        if(typeof $variable_fields_with_tags !== 'undefined'){
            if($variable_fields_with_tags.length!=0){
                SUPER.update_variable_fields.loop($changed_field, $form, $variable_fields_with_tags);
            }
        }
    }

    // @since 3.0.0 - replace variable field {tags} with actual field values
    SUPER.update_variable_fields.replace_tags = function($form, $regular_expression, $v_value, $target){

        if(typeof $target === 'undefined') $target = null;

        var $array = [],
            $value = '',
            $i = 0;
        while (($match = $regular_expression.exec($v_value)) != null) {
            $array[$i] = $match[1];
            $i++;
        }

        for (var $i = 0; $i < $array.length; $i++) {
            var $name = $array[$i];
            if($name=='dynamic_column_counter'){
                if($target!=null){
                    $v_value = $target.parents('.super-duplicate-column-fields:eq(0)').index()+1;
                    return $v_value;
                }
            }

            // @since 3.2.0 - Compatibility with advanced tags {option;2;int}
            var $old_name = $name,
                $options = $name.toString().split(';'),
                $name = $options[0], // this is the field name e.g: {option;2} the variable $name would contain: option
                $value_type = 'var'; // return field value as 'var' or 'int' {field;2;var} to return varchar or {field;2;int} to return integer

            if(typeof $options[1] === 'undefined'){
                var $value_n = 0;
            }else{
                var $value_n = $options[1];
                // if the index value is 1 set it to 0 so it will return the value
                if($value_n==1){
                    $value_n = 0;
                }
                if(typeof $options[2] !== 'undefined'){
                    if( ($options[2]!='var') && ($options[2]!='int') ) {
                        $value_type = 'var';
                    }else{
                        $value_type = $options[2];
                    }
                }
            }

            var $default_value = '';
            if($value_type=='int'){
                $default_value = 0;
            }

            var $element = $form[0].querySelector('.super-shortcode-field[name="'+$name+'"]');
            if($element){
                // Check if parent column or element is hidden (conditionally hidden)
                var $hidden = false;
                for (var p = $element && $element.parentElement; p; p = p.parentElement) {
                    if(p.classList.contains('super-form')) {
                        break;
                    } 
                    if(p.classList.contains('super-column')){
                        if(p.style.display === 'none'){
                            $hidden = true;
                        }
                    }
                }

                var $parent = $element.closest('.super-shortcode');

                if( $hidden==true || ($parent.style.display==='none' && !$parent.classList.contains('super-hidden')) ) {
                    // Exclude conditionally
                    // Lets just replace the field name with 0 as a value
                    $v_value = $v_value.replace('{'+$name+'}', $default_value);
                    $v_value = $v_value.replace('{'+$name+';label}', $default_value);
                }else{
                    if( !$element ) {
                        // Lets just replace the field name with 0 as a value
                        $v_value = $v_value.replace('{'+$name+'}', $default_value);
                        $v_value = $v_value.replace('{'+$name+';label}', $default_value);
                    }else{
                        var $text_field = true;
                        
                        var $parent = $element.closest('.super-field');

                        // Check if dropdown field
                        if($parent.classList.contains('super-dropdown') || $parent.classList.contains('super-countries')){
                            $text_field = false;
                            var $sum = '';

                            // @since 3.2.0 - check if we want to return integer for this {tag}  e.g: {field;2;int}
                            if($value_type=='int') var $sum = 0;

                            var $selected = $parent.querySelectorAll('.super-dropdown-ui li.super-active:not(.super-placeholder)');
                            Object.keys($selected).forEach(function(key) {
                                // @since 3.6.0 - check if we want to return the label instead of a value
                                if($value_n=='label'){
                                    var $new_value = $selected[key].innerText;
                                }else{
                                    var $new_value = $selected[key].dataset['value'].toString().split(';');
                                    if($value_n==0){
                                        $new_value = $new_value[0];
                                    }else{
                                        // return default value if undefined
                                        if(typeof $new_value[($value_n-1)]==='undefined'){
                                            $new_value = $new_value[0];
                                        }else{
                                            $new_value = $new_value[($value_n-1)];
                                        }
                                    }
                                }
                                if(typeof $new_value==='undefined'){
                                    $new_value = '';
                                }

                                // @since 3.2.0 - check if we want to return integer for this {tag}  e.g: {field;2;int}
                                if($value_type=='int'){
                                    $sum += parseFloat($new_value);
                                }else{
                                    if($sum==''){
                                        $sum += $new_value;
                                    }else{
                                        $sum += ','+$new_value;
                                    }
                                }
                            });
                            $value = $sum;
                        }
                        // Check if checkbox field
                        if($parent.classList.contains('super-checkbox')){
                            $text_field = false;
                            var $checked = $parent.querySelectorAll('.super-field-wrapper > label.super-active');
                            var $values = '';
                            Object.keys($checked).forEach(function(key) {
                                // @since 3.6.0 - check if we want to return the label instead of a value
                                if($value_n=='label'){
                                    if($values==''){
                                        $values += $checked[key].innerText;
                                    }else{
                                        $values += ', '+$checked[key].innerText;
                                    }
                                }else{
                                    if($values==''){
                                        $values += $checked[key].querySelector('input').value;
                                    }else{
                                        $values += ','+$checked[key].querySelector('input').value;
                                    }
                                }
                            });
                            var $sum = '';
                            
                            // @since 3.2.0 - check if we want to return integer for this {tag}  e.g: {field;2;int}
                            if($value_type=='int') var $sum = 0;
                           
                            // @since 3.6.0 - check if we want to return the label instead of a value
                            if($value_n=='label'){
                                $sum += $values;
                            }else{
                                // @since 1.7.0 - checkbox compatibility with advanced tags like {field;2} etc.
                                var $new_value_array = $values.toString().split(',');
                                Object.keys($new_value_array).forEach(function(key) {
                                    var v = $new_value_array[key].toString().split(';');
                                    if($value_n==0){
                                        $new_value = v[0];
                                    }else{
                                        $new_value = v[($value_n-1)];
                                    }
                                    if(typeof $new_value==='undefined'){
                                        $new_value = '';
                                    }

                                    // @since 3.2.0 - check if we want to return integer for this {tag}  e.g: {field;2;int}
                                    if($value_type=='int'){
                                        $sum += parseFloat($new_value);
                                    }else{
                                        $sum += ($new_value);
                                    }
                                });
                            }
                            $value = $sum;
                        }
                        // @since 1.7.0 - check for radio tags because it now can contain advanced tags like {field;2} etc.
                        if($parent.classList.contains('super-radio')){
                            $text_field = false;
                            var $new_value = $element.value.toString().split(';');
                            if($value_n==0){
                                $new_value = $new_value[0];
                            }else{
                                $new_value = $new_value[($value_n-1)];
                            }
                            if(typeof $new_value==='undefined'){
                                $new_value = '';
                            }

                            // @since 3.6.0 - check if we want to return the label instead of a value
                            if($value_n=='label'){
                                var $new_value = '';
                                var selected = $element.closest('.super-field').querySelector('.super-field-wrapper .super-active');
                                if(selected){
                                    $new_value = selected.innerText;
                                }
                            }

                            // @since 3.2.0 - check if we want to return integer for this {tag}  e.g: {field;2;int}
                            if($value_type=='int'){
                                $value = parseFloat($new_value);
                            }else{
                                $value = ($new_value);
                            }
                        }

                        // @since 3.8.0 - check if variable field and check for advanced tags like {field;2} etc.
                        if($parent.classList.contains('super-hidden')){
                            if($parent.dataset['conditional_variable_action']=='enabled'){
                                $text_field = false;
                                var $new_value = $element.value.toString().split(';');
                                if($value_n==0){
                                    $new_value = $new_value[0];
                                }else{
                                    $new_value = $new_value[($value_n-1)];
                                }
                                if(typeof $new_value==='undefined'){
                                    $new_value = '';
                                }
                                if($value_type=='int'){
                                    $value = parseFloat($new_value);
                                }else{
                                    $value = $new_value;
                                }
                            }
                        }

                        if( $text_field==true ) {
                            // Check if text field is a auto-suggest, if so grab the value from the selected item
                            if($element.closest('.super-shortcode').classList.contains('super-auto-suggest') || $element.closest('.super-shortcode').classList.contains('super-wc-order-search')){
                                if($element.closest('.super-field-wrapper').querySelector('.super-active')){
                                    var $new_value = $element.closest('.super-field-wrapper').querySelector('.super-active').dataset.value;
                                    $new_value = $new_value.toString().split(';');
                                    if($value_n==0){
                                        $new_value = $new_value[0];
                                    }else{
                                        $new_value = $new_value[($value_n-1)];
                                    }
                                    if(typeof $new_value==='undefined'){
                                        $new_value = '';
                                    }
                                    $value = $new_value;
                                }
                            }else{
                                $value = $element.value;
                            }
                            if( $target ) {
                                if( (typeof $element.dataset['value'] !== 'undefined') && ($target[0].classList.contains('super-html-content')) ) {
                                    $value = $element.dataset['value'];
                                }
                            }
                            if( $value_type=='int' ) {
                                $value = ($value) ? parseFloat($value) : '';
                            }
                        }
                        if( ($value_type=='int') && (isNaN($value)) ) {
                            $value = $default_value;
                        }
                        $v_value = $v_value.replace('{'+$old_name+'}', $value);
                    }
                }
            }
        }
        return $v_value;
    }

    // @since 2.3.0 - Update variable fields loop function
    SUPER.update_variable_fields.loop = function($changed_field, $form, $variable_fields){
        var $regular_expression = /\{(.*?)\}/g;
        var $updated_variable_fields = {};
        $variable_fields.each(function(){
            var $this = $(this);
            var $wrapper = $this.parent('.super-shortcode');
            var $field = $wrapper.find('.super-shortcode-field');
            var $counter = 0;
            var $prev_match_found = false;
            var $conditions = jQuery.parseJSON($this.val());
            if(typeof $conditions !== 'undefined'){
                var $field_values = {};
                $.each($conditions, function( index, v ) {
                    v.variable_value = v.new_value
                    if(typeof $field_values[v.field] === 'undefined'){
                        var $shortcode_field = $form.find('.super-shortcode-field[name="'+v.field+'"]');
                        var $shortcode_field_value = $shortcode_field.val();
                        if(typeof $shortcode_field_value === 'undefined') $shortcode_field_value = '';
                        $field_values[v.field] = {};
                        $field_values[v.field].field = $shortcode_field;
                        $field_values[v.field].value = $shortcode_field_value;
                        $shortcode_field.parents('.super-shortcode.super-column').each(function(){
                            if($(this).css('display')=='none') {
                                $field_values[v.field].skip = true
                            }
                        });
                        var $parent = $shortcode_field.parents('.super-shortcode:eq(0)');
                        $field_values[v.field].parent = {};
                        $field_values[v.field].parent.element = $parent;
                        if( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) {
                            $field_values[v.field].skip = true
                        }
                        $field_values[v.field].parent.hasClass = {};
                        $field_values[v.field].parent.hasClass.checkbox = $parent.hasClass('super-checkbox');
                        $field_values[v.field].parent.hasClass.radio = $parent.hasClass('super-radio');
                        $field_values[v.field].parent.hasClass.dropdown = $parent.hasClass('super-dropdown');
                        $field_values[v.field].parent.hasClass.countries = $parent.hasClass('super-countries');
                    }else{
                        $shortcode_field = $field_values[v.field].field;
                        $shortcode_field_value = $field_values[v.field].value;
                        var $parent = $shortcode_field.parents('.super-shortcode:eq(0)');
                    }

                    // @since 3.6.0
                    $shortcode_field_value = SUPER.return_dynamic_tag_value($parent, $shortcode_field_value);

                    if( (typeof $field_values[v.field_and] === 'undefined') && ( v.and_method!='' ) ) {
                        var $shortcode_field_and = $form.find('.super-shortcode-field[name="'+v.field_and+'"]');
                        var $shortcode_field_and_value = $shortcode_field_and.val();
                        if(typeof $shortcode_field_and_value === 'undefined') $shortcode_field_and_value = '';
                        $field_values[v.field_and] = {};
                        $field_values[v.field_and].field = $shortcode_field_and;
                        $field_values[v.field_and].value = $shortcode_field_and_value;
                        $shortcode_field_and.parents('.super-shortcode.super-column').each(function(){
                            if($(this).css('display')=='none') {
                                $field_values[v.field_and].skip = true
                            }
                        });
                        var $parent = $shortcode_field_and.parents('.super-shortcode:eq(0)');
                        $field_values[v.field_and].parent = {};
                        $field_values[v.field_and].parent.element = $parent;
                        if( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) {
                            $field_values[v.field_and].skip = true
                        }
                        $field_values[v.field_and].parent.hasClass = {};
                        $field_values[v.field_and].parent.hasClass.checkbox = $parent.hasClass('super-checkbox');
                        $field_values[v.field_and].parent.hasClass.radio = $parent.hasClass('super-radio');
                        $field_values[v.field_and].parent.hasClass.dropdown = $parent.hasClass('super-dropdown');
                        $field_values[v.field_and].parent.hasClass.countries = $parent.hasClass('super-countries');

                        // @since 3.6.0
                        $shortcode_field_and_value = SUPER.return_dynamic_tag_value($parent, $shortcode_field_and_value);

                    }else{
                        if(typeof $field_values[v.field_and] !== 'undefined'){
                            $shortcode_field_and = $field_values[v.field_and].field;
                            $shortcode_field_and_value = $field_values[v.field_and].value;
                            var $parent = $shortcode_field_and.parents('.super-shortcode:eq(0)');

                            // @since 3.6.0
                            $shortcode_field_and_value = SUPER.return_dynamic_tag_value($parent, $shortcode_field_and_value);
                        }
                    }

                    // Let's see if this conditional rule should be skipped or not
                    // This is the case when for instance the field doesn't exist, or when the field was conditionally hidden
                    // This check must be done for both the 'field' and 'field_and', but only check for the 'field_and" if the 'and_method' is not empty
                    // if( ( (typeof $field_values[v.field] !== 'undefined') && ($field_values[v.field].skip==true) ) || ( (typeof $field_values[v.field_and] !== 'undefined') && ($field_values[v.field_and].skip==true) ) ) {
                    if( ( (typeof $field_values[v.field] !== 'undefined') && ($field_values[v.field].skip==true) ) || 
                        ( (v.and_method !== '') && (typeof $field_values[v.field_and] !== 'undefined') && ($field_values[v.field_and].skip==true) ) ) {
                        // Exclude conditionally
                    }else{

                        // @since 3.0.0 - make sure {tags} are replaced with the correct field value to update the variable field value
                        v.variable_value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.variable_value);
                        v.value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.value);
                        v.value_and = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.value_and);

                        // Generate correct value before checking conditional logic
                        if( (v.logic=='greater_than') || (v.logic=='less_than') || (v.logic=='greater_than_or_equal') || (v.logic=='less_than_or_equal') ) {
                            // Check if dropdown field
                            var $parent = $field_values[v.field].parent.element;
                            if( ( $field_values[v.field].parent.hasClass.dropdown ) || ( $field_values[v.field].parent.hasClass.countries ) ){
                                var $sum = 0;
                                $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)').each(function () {
                                    $sum += parseFloat($(this).data('value'));
                                });
                                $shortcode_field_value = $sum;
                            }
                            // Check if checkbox field
                            if( $field_values[v.field].parent.hasClass.checkbox ) {
                                var $sum = 0;
                                $parent.find('input[type="checkbox"]:checked').each(function () {
                                    $sum += parseFloat($(this).val());
                                });
                                $shortcode_field_value = $sum;
                            }
                        }

                        // Generate correct and value before checking conditional logic
                        if( (v.logic_and=='greater_than') || (v.logic_and=='less_than') || (v.logic_and=='greater_than_or_equal') || (v.logic_and=='less_than_or_equal') ) {
                            if(typeof $field_values[v.field_and] !== 'undefined' ) {
                                var $parent = $field_values[v.field_and].parent.element;
                                // Check if dropdown field
                                if( ( $field_values[v.field_and].parent.hasClass.dropdown ) || ( $field_values[v.field_and].parent.hasClass.countries ) ){
                                    var $sum = 0;
                                    $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)').each(function () {
                                        $sum += $(this).data('value');
                                    });
                                    $shortcode_field_and_value = $sum;
                                }
                                // Check if checkbox field
                                if( $field_values[v.field_and].parent.hasClass.checkbox ) {
                                    var $sum = 0;
                                    $parent.find('input[type="checkbox"]:checked').each(function () {
                                        $sum += $(this).val();
                                    });
                                    $shortcode_field_and_value = $sum;
                                }
                            }
                        }

                        var $match_found = 0;

                        if( ( v.logic=='equal' ) && ( v.value==$shortcode_field_value ) ) $match_found++;
                        if( ( v.logic=='not_equal' ) && ( v.value!=$shortcode_field_value ) ) $match_found++;
                        if( ( v.logic=='greater_than' ) && ( parseFloat($shortcode_field_value)>parseFloat(v.value) ) ) $match_found++;
                        if( ( v.logic=='less_than' ) && ( parseFloat($shortcode_field_value)<parseFloat(v.value) ) ) $match_found++;
                        if( ( v.logic=='greater_than_or_equal' ) && ( parseFloat($shortcode_field_value)>=parseFloat(v.value) ) ) $match_found++;
                        if( ( v.logic=='less_than_or_equal' ) && ( parseFloat($shortcode_field_value)<=parseFloat(v.value) ) ) $match_found++;
                        if( v.and_method!='' ) {
                            if( ( v.logic_and=='equal' ) && ( v.value_and==$shortcode_field_and_value ) ) $match_found++;
                            if( ( v.logic_and=='not_equal' ) && ( v.value_and!=$shortcode_field_and_value ) ) $match_found++;
                            if( ( v.logic_and=='greater_than' ) && ( parseFloat($shortcode_field_and_value)>parseFloat(v.value_and) ) ) $match_found++;
                            if( ( v.logic_and=='less_than' ) && ( parseFloat($shortcode_field_and_value)<parseFloat(v.value_and) ) ) $match_found++;
                            if( ( v.logic_and=='greater_than_or_equal' ) && ( parseFloat($shortcode_field_and_value)>=parseFloat(v.value_and) ) ) $match_found++;
                            if( ( v.logic_and=='less_than_or_equal' ) && ( parseFloat($shortcode_field_and_value)<=parseFloat(v.value_and) ) ) $match_found++;
                        }

                        if( v.logic=='contains' ) {
                            // When the field is a checkbox or dropdown
                            var $parent = $field_values[v.field].parent.element;
                            if( ( $field_values[v.field].parent.hasClass.checkbox ) || 
                                ( $field_values[v.field].parent.hasClass.radio ) || 
                                ( $field_values[v.field].parent.hasClass.dropdown ) || 
                                ( $field_values[v.field].parent.hasClass.countries ) ) {
                                if(typeof $field_values[v.field].parent.element.split_checked === 'undefined') {
                                    $field_values[v.field].parent.element.split_checked = $shortcode_field_value.split(',');
                                }
                                var $string_value = v.value.toString();
                                $.each($field_values[v.field].parent.element.split_checked, function( index, value ) {
                                    if( value.indexOf($string_value) >= 0) {
                                        $match_found++;
                                        return false
                                    }
                                });
                            }else{
                                // If other field
                                if( $shortcode_field_value.indexOf(v.value) >= 0) $match_found++;
                            }
                        }
                        if( v.and_method!='' ) {
                            if( v.logic_and=='contains' ) {
                                // When the field is a checkbox or dropdown
                                var $parent = $field_values[v.field_and].parent.element;
                                if( ( $field_values[v.field_and].parent.hasClass.checkbox ) || 
                                    ( $field_values[v.field_and].parent.hasClass.radio ) || 
                                    ( $field_values[v.field_and].parent.hasClass.dropdown ) || 
                                    ( $field_values[v.field_and].parent.hasClass.countries ) ) {
                                    if(typeof $field_values[v.field_and].parent.element.split_checked === 'undefined') {
                                        $field_values[v.field_and].parent.element.split_checked = $shortcode_field_and_value.split(',');
                                    }
                                    var $string_value = v.value_and.toString();
                                    $.each($field_values[v.field_and].parent.element.split_checked, function( index, value ) {
                                        if( value.indexOf($string_value) >= 0) {
                                            $match_found++;
                                            return false
                                        }
                                    });
                                }else{
                                    // If other field
                                    if( $shortcode_field_and_value.indexOf(v.value_and) >= 0) $match_found++;
                                }
                            }
                        }

                        if( v.and_method=='and' ) {
                            if($match_found>=2) {
                                $prev_match_found = true;
                                if( v.new_value!='' ) {
                                    v.new_value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.new_value);
                                }
                                $field.val(v.new_value);
                            }else{
                                if($prev_match_found==false){
                                    $field.val('');
                                }
                            }
                        }else{
                            if($match_found>=1) {
                                $prev_match_found = true;
                                if( v.new_value!='' ) {
                                    v.new_value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, v.new_value);
                                }
                                $field.val(v.new_value);
                            }else{
                                if($prev_match_found==false){
                                    $field.val('');
                                }
                            }
                        }
                    }
                    $updated_variable_fields[$field.attr('name')] = $field;
                });
            }
        });

        // @since 2.3.0 - update conditional logic and other variable fields based on the updated variable field
        $.each($updated_variable_fields, function( index, field ) {
            SUPER.after_field_change_blur_hook(field);
        });

    }


    // Fade in fields one by one (like a survey)
    SUPER.loop_fade = function($next, $duration){
        $next.fadeIn($duration);  
        if(($next.hasClass('super-extra-shortcode')) || ($next.hasClass('hidden'))){
            SUPER.loop_fade($next.next('.super-field'), $duration);  
        }else{
            var $this = $next.children('div').children('input,textarea,select');
            var $validation = $this.data('validation');
            var $conditional_validation = $this.data('conditional-validation');
            if( ($validation=='none') && ($conditional_validation=='none') ) {
                var $next = $this.parents('.super-field').next('.super-field');
                SUPER.loop_fade($next, $duration);                
            }
        }
    }

    // Send the email after a successfull submition
    SUPER.complete_submit = function( $form, $duration, $old_html, $status, $status_update ){

        // @since 3.4.0 - entry status
        if(typeof $status === 'undefined') var $status = '';
        if(typeof $status_update === 'undefined') var $status_update = '';

        // @since 3.2.0 - prepare form/email data
        $data = SUPER.prepare_form_data($form);

        var $form_id = $data.form_id;
        var $entry_id = $data.entry_id;

        // @since 1.3
        $data = SUPER.after_form_data_collected_hook($data.data);

        // @since 3.2.0 - honeypot captcha check, if value is not empty cancel form submission
        $data['super_hp'] = $form.find('input[name="super_hp"]').val();
        if($data['super_hp']!=''){
            return false;
        }

        // @since 2.9.0 - json data POST
        var $json_data = JSON.stringify($data);
        $form.find('textarea[name="json_data"]').val($json_data);

        $.ajax({
            url: super_common_i18n.ajaxurl,
            type: 'post',
            data: {
                action: 'super_send_email',
                data: $data,
                form_id: $form_id,
                entry_id: $entry_id,
                entry_status: $status,
                entry_status_update: $status_update
            },
            success: function (result) {
                $('.super-msg').remove();
                var $result = jQuery.parseJSON(result);
                if($result.error==true){
                    var $html = '<div class="super-msg super-error">';
                    if(typeof $result.fields !== 'undefined'){
                        $.each($result.fields, function( index, value ) {
                            $(value+'[name="'+index+'"]').parent().addClass('error');
                        });
                    }                               
                }else{

                    SUPER.after_email_send_hook($form);

                    // @since 2.2.0 - custom form POST method
                    if( ($form.children('form').attr('method')=='post') && ($form.children('form').attr('action')!='') ){
                        $form.children('form').submit();
                        return false;
                    }

                    var $html = '<div class="super-msg super-success"';
                    // @since 3.4.0 - option to not display the message
                    if($result.display==false){
                        $html += 'style="display:none;">';
                    }
                    $html += '>';
                }

                if($result.redirect){
                    window.location.href = $result.redirect;
                }else{
                    if($result.msg!=''){
                        $html += $result.msg;
                        $html += '<span class="close"></span>';
                        $html += '</div>';
                        $($html).prependTo($form);
                    }

                    // @since 3.4.0 - keep loading state active
                    if($result.loading!=true){

                        // @since 2.1.0
                        var $proceed = SUPER.before_scrolling_to_message_hook($form, $form.offset().top - 30);
                        if($proceed==true){
                            $('html, body').animate({
                                scrollTop: $form.offset().top-200
                            }, 1000);
                        }
                        
                        $form.find('.super-form-button.super-loading .super-button-name').html($old_html);
                        $form.find('.super-form-button.super-loading').removeClass('super-loading');
                        if($result.error==false){

                            // @since 2.0.0 - hide form or not
                            if($form.data('hide')==true){
                                $form.find('.super-field, .super-multipart-progress, .super-field, .super-multipart-steps').fadeOut($duration);
                                setTimeout(function () {
                                    $form.find('.super-field, .super-shortcode').remove();
                                }, $duration);
                            }else{
                                // @since 2.0.0 - clear form after submitting
                                if($form.data('clear')==true){
                                    SUPER.init_clear_form($form);
                                }
                            }
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
                alert('Failed to process data, please try again');
            }
        });
    }

    // File upload handler
    SUPER.upload_files = function( $form, $data, $duration, $old_html, $status, $status_update ){
        $form.find('.super-fileupload-files').each(function(){
            var $minfiles = $(this).parent().find('.super-active-files').data('minfiles');
            if( typeof $minfiles === 'undefined' ) {
                $minfiles = 0;
            }
            if( ( $minfiles==0 ) && ( $(this).parent().find('.super-fileupload-files').children('div').length == 0 ) ) {
                $(this).parent().find('.super-fileupload').addClass('finished');
            }
        });
        $form.find('.super-fileupload-files > div:not(.super-uploaded)').each(function(){
            var data = $(this).data();
            data.submit();
        });
        $form.find('.super-fileupload').on('fileuploaddone', function (e, data) {
            var $field = $(this).parents('.super-field-wrapper:eq(0)').children('input[type="hidden"]');
            $.each(data.result.files, function (index, file) {
                if(!file.error){
                    if($field.val()==''){
                        $field.val(file.name);
                    }else{
                        $field.val($field.val()+','+file.name);
                    }
                }
            });
            var $value = $field.val();
            var $value = $value.split(',');
            $data[$field.attr('name')] = $field.val();
            if($(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files > div.error').length){
                $form.find('.super-form-button.super-loading .super-button-name').html($old_html);
                $form.find('.super-form-button.super-loading').removeClass('super-loading');
                clearInterval($interval);
            }else{
                if($(this).parents('.super-field-wrapper:eq(0)').find('.super-fileupload-files > div:not(.error)').length == $value.length){
                    $(this).addClass('finished');
                }
            }
        });
        var $interval = setInterval(function() {
            var $total_file_uploads = 0;
            $form.find('.super-fileupload').each(function(){
                var $shortcode_field = $(this);
                var $skip = false;
                $shortcode_field.parents('.super-shortcode.super-column').each(function(){
                    if($(this).css('display')=='none') {
                        $skip = true;
                    }
                });
                var $parent = $shortcode_field.parents('.super-shortcode:eq(0)');
                if( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) {
                    $skip = true;
                }
                if( $skip!=true ) {
                    $total_file_uploads++;
                }else{
                    $shortcode_field.removeClass('finished');
                }
            });
            if($form.find('.super-fileupload.finished').length == $total_file_uploads){
                clearInterval($interval);
                SUPER.init_fileupload_fields();
                $form.find('.super-fileupload').removeClass('super-rendered').fileupload('destroy');
                setTimeout(function() {
                    SUPER.complete_submit( $form, $duration, $old_html, $status, $status_update );
                }, 1000);
            }
        }, 1000);

    }

    // Trim strings
    SUPER.trim = function($this) {
        if(typeof $this === 'string'){
            return $this.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
        }
    }

    // Check for errors, validate fields
    SUPER.handle_validations = function($this, $validation, $conditional_validation, $duration) {
        
        /*
        For validations we can set a lot of options.
        However, we only used the most commonly used ones.
        Below is a complete list for all possible validation to use in futurue
        */
        
        /*--- jQuery RegExp for Numbers ---*/

        //select integers only
        var intRegex = '/[0-9 -()+]+$/';   
        //match any ip address
        var ipRegex = 'bd{1,3}.d{1,3}.d{1,3}.d{1,3}b';  
        //match number in range 0-255
        var num0to255Regex = '^([01][0-9][0-9]|2[0-4][0-9]|25[0-5])$';
        //match number in range 0-999 
        var num0to999Regex = '^([0-9]|[1-9][0-9]|[1-9][0-9][0-9])$';
        //match ints and floats/decimals
        var floatRegex = '[-+]?([0-9]*.[0-9]+|[0-9]+)'; 
        //Match Any number from 1 to 50 inclusive
        var number1to50Regex = '/(^[1-9]{1}$|^[1-4]{1}[0-9]{1}$|^50$)/gm'; 

        
        /*--- jQuery RegExp for Validation ---*/
        
        //match email address
        var emailRegex = '^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$'; 
        //match credit card numbers
        var creditCardRegex = '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35d{3})d{11})$'; 
        //match username
        var usernameRegex = '/^[a-z0-9_-]{3,16}$/'; 
        //match password
        var passwordRegex = '/^[a-z0-9_-]{6,18}$/'; 
        //Match 8 to 15 character string with at least one upper case letter, one lower case letter, and one digit (useful for passwords).
        var passwordStrengthRegex = '/((?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,15})/gm'; 
        //match elements that could contain a phone number
        var phoneNumber = '/[0-9-()+]{3,20}/'; 

        
        /*--- jQuery RegExp for Dates ---*/

        //MatchDate (e.g. 21/3/2006)
        var dateRegex = '/(d{1,2}/d{1,2}/d{4})/gm'; 
        //match date in format MM/DD/YYYY
        var dateMMDDYYYRegex = '^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)dd$'; 
        //match date in format DD/MM/YYYY
        var dateDDMMYYYRegex = '^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)dd$';


        /*--- jQuery RegExp for URLs ---*/

        //match a url
        //var urlRegex = '/^(https?://)?([da-z.-]+).([a-z.]{2,6})([/w .-]*)*/?$/'; 
        //match a url slug (letters/numbers/hypens)
        var urlslugRegex = '/^[a-z0-9-]+$/'; 
        //match a url string (Fixes spaces and querystrings)
        //var urlRegex = '/(https?://)?([da-z.-]+).([a-z.]{2,6})([/w.-=?]*)*/?/';
        var urlRegex = /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;


        /*--- jQuery RegExp for Domain Names ---*/

        //match domain name (with HTTP)
        var domainRegex = '/(.*?)[^w{3}.]([a-zA-Z0-9]([a-zA-Z0-9-]{0,65}[a-zA-Z0-9])?.)+[a-zA-Z]{2,6}/igm'; 
        //match domain name (www. only) 
        var domainRegex = '/[^w{3}.]([a-zA-Z0-9]([a-zA-Z0-9-]{0,65}[a-zA-Z0-9])?.)+[a-zA-Z]{2,6}/igm'; 
        //match domain name (alternative)
        var domainRegex = '/(.*?).(com|net|org|info|coop|int|com.au|co.uk|org.uk|ac.uk|)/igm'; 
        //match sub domains: www, dev, int, stage, int.travel, stage.travel
        var subDomainRegex = '/(http://|https://)?(www.|dev.)?(int.|stage.)?(travel.)?(.*)+?/igm';


        /*--- jQuery RegExp for Images ---*/

        //Match jpg, gif or png image   
        var imageRegex = '/([^s]+(?=.(jpg|gif|png)).2)/gm'; 
        //match all images
        var imgTagsRegex = '/<img .+?src="(.*?)".+?/>/ig';  
        //match just .png images
        var imgPngRegex = '/<img .+?src="(.*?.png)".+?/>/ig';


        /*--- Other Useful jQuery RegExp Examples ---*/

        //match RGB (color) string
        var rgbRegex = '/^rgb((d+),s*(d+),s*(d+))$/';  
        //match hex (color) string
        var hexRegex = '/^#?([a-f0-9]{6}|[a-f0-9]{3})$/'; 
        //Match Valid hexadecimal colour code
        var hexRegex = '/(#?([A-Fa-f0-9]){3}(([A-Fa-f0-9]){3})?)/gm'; 
        //match a HTML tag (v1)
        var htmlTagRegex = '/^< ([a-z]+)([^<]+)*(?:>(.*)< /1>|s+/>)$/'; 
        //match HTML Tags (v2)
        var htmlTagRegex = '/(< (/?[^>]+)>)/gm'; 
        //match /product/123456789
        var productUrlRegex = '(/product/)?+[0-9]+';  
        //Match Letters, numbers and hyphens
        var lnhRegex = '/([A-Za-z0-9-]+)/gm';  
        //match all .js includes    
        var jsTagsRegex = '/<script .+?src="(.+?.js(?:?v=d)*).+?script>/ig';  
        //match all .css includes
        var cssTagsRegex = '/<link .+?href="(.+?.css(?:?v=d)*).+?/>/ig'; 

        var $error = false;

        // @since 1.2.5     - custom regex
        var $custom_regex = $this.parent().find('.super-custom-regex').val();

        var $may_be_empty = $this.data('may-be-empty');


        if( ($may_be_empty==true) && ($this.val().length==0) ) {
            return false;
        }

        $('.super-field.conditional[data-conditionalfield="'+$this.attr('name')+'"]').each(function(){
            if($(this).data('conditionalvalue')==$this.val()){
                $(this).addClass('active');
                $(this).find('select').data('excludeconditional','0');
            }else{
                $(this).removeClass('active');
                $(this).find('select').data('excludeconditional','1');
            }
        });

        if( $custom_regex!='' ) {
            var $regex = new RegExp($custom_regex);
            var $value = $this.val();
            if($regex.test($value)) {
            }else{
                $error = true;
            }
        }
        if ($validation == 'captcha') {
            $error = true;
        }
        if ($validation == 'numeric') {
            var $regex = /^\d+$/;
            var $value = $this.val();
            if (!$regex.test($value)) {
                $error = true;
            }
        }
        if ($validation == 'float') {
            var $regex = /^[+-]?\d+(\.\d+)?$/;
            var $value = $this.val();
            if (!$regex.test($value)) {
                $error = true;
            }
        }
        if ($validation == 'empty') {
            if(SUPER.trim($this.val()) == '') {
                $error = true;
            }
        }
        if ($validation == 'email') {
            if (($this.val().length < 4) || (!/^([\w-\.]+@([\w-]+\.)+[\w-]{2,63})?$/.test($this.val()))) {
                $error = true;
            }
        }
        if ($validation == 'phone') {
            var $regex = /^((\+)?[1-9]{1,2})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/;
            var $value = $this.val();
            var $numbers = $value.split("").length;
            if (10 <= $numbers && $numbers <= 20 && $regex.test($value)) {
            }else{
                $error = true;
            }
        }
        if ($validation == 'website') {
            var $value = $this.val();
            var pattern = new RegExp(urlRegex);
            if(pattern.test($value)) {
            }else{
                $error = true;
            }
        }

        // @since 2.6.0 - IBAN validation
        if ($validation == 'iban') {
            var $value = $this.val();
            if( (IBAN.isValid($value)==false) && ($value!='') ) {
                $error = true;
            }
        }

        var $attr = $this.attr('data-minlength');
        if (typeof $attr !== 'undefined' && $attr !== false) {
            var $text_field = true;
            var $total = 0;
            var $parent = $this.parents('.super-field:eq(0)');
            if($parent.hasClass('super-checkbox')){
                $text_field = false;
                var $checked = $parent.find('label.super-active');
                if($checked.length < $attr){
                    $error = true;
                }

            }
            if( ($parent.hasClass('super-dropdown')) || ($parent.hasClass('super-countries')) ){
                $text_field = false;
                var $total = $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)').length;
                if($total < $attr){
                    $error = true;
                }
            }
            if($parent.hasClass('super-keyword-tags')){
                $text_field = false;
                var $total = $parent.find('.super-shortcode-field > div > span').length;
                if($total < $attr){
                    $error = true;
                }
            }
            if($text_field==true){
                if(!$parent.hasClass('super-date')){
                    if($this.val().length < $attr){
                        $error = true;
                    }
                }
            }       
        }

        var $attr = $this.attr('data-maxlength');
        if (typeof $attr !== 'undefined' && $attr !== false) {
            var $text_field = true;
            var $total = 0;
            var $parent = $this.parents('.super-field:eq(0)');
            if($parent.hasClass('super-checkbox')){
                $text_field = false;
                var $checked = $parent.find('label.super-active');
                if($checked.length > $attr){
                    $error = true;
                }
            }
            if( ($parent.hasClass('super-dropdown')) || ($parent.hasClass('super-countries')) ){
                $text_field = false;
                var $total = $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)').length;
                if($total > $attr){
                    $error = true;
                }
            }
            if($parent.hasClass('super-keyword-tags')){
                $text_field = false;
                var $total = $parent.find('.super-shortcode-field > div > span').length;
                if($total > $attr){
                    $error = true;
                }
            }
            if($text_field==true){
                if(!$parent.hasClass('super-date')){
                    if($this.val().length > $attr){
                        $error = true;
                    }
                }
            }
        }

        var $attr = $this.attr('data-minnumber');
        if (typeof $attr !== 'undefined' && $attr !== false) {
            
            // Check if currency field
            var $parent = $this.parents('.super-field:eq(0)');
            if($parent.hasClass('super-currency')){
                var $value = $this.val();
                var $currency = $this.data('currency');
                var $format = $this.data('format');
                var $decimals = $this.data('decimals');
                var $thousand_separator = $this.data('thousand-separator');
                var $decimal_seperator = $this.data('decimal-separator');
                $value = $value.replace($currency, '').replace($format, '');
                $value = $value.split($thousand_separator).join('');
                $value = $value.split($decimal_seperator).join('.');
                $value = ($value) ? parseFloat($value) : 0;
                if( $value < parseFloat($attr) ) {
                    $error = true;
                }
            }else{
                if( parseFloat($this.val()) < parseFloat($attr) ) {
                    $error = true;
                }
            }
        }

        var $attr = $this.attr('data-maxnumber');
        if (typeof $attr !== 'undefined' && $attr !== false) {

            // Check if currency field
            var $parent = $this.parents('.super-field:eq(0)');
            if($parent.hasClass('super-currency')){
                var $value = $this.val();
                var $currency = $this.data('currency');
                var $format = $this.data('format');
                var $decimals = $this.data('decimals');
                var $thousand_separator = $this.data('thousand-separator');
                var $decimal_seperator = $this.data('decimal-separator');
                $value = $value.replace($currency, '').replace($format, '');
                $value = $value.split($thousand_separator).join('');
                $value = $value.split($decimal_seperator).join('.');
                $value = ($value) ? parseFloat($value) : 0;
                if( $value > parseFloat($attr) ) {
                    $error = true;
                }
            }else{
                if( parseFloat($this.val()) > parseFloat($attr) ) {
                    $error = true;
                }
            }
        }    

        // @since   1.0.6
        var $logic = $conditional_validation;
        if( typeof $logic !== 'undefined' && $logic!='none' && $logic!='' ) {
            var $field_value = $this.val();

            // Check if currency field
            var $parent = $this.parents('.super-field:eq(0)');
            if($parent.hasClass('super-currency')){
                var $value = $this.val();
                var $currency = $this.data('currency');
                var $format = $this.data('format');
                var $decimals = $this.data('decimals');
                var $thousand_separator = $this.data('thousand-separator');
                var $decimal_seperator = $this.data('decimal-separator');
                $value = $value.replace($currency, '').replace($format, '');
                $value = $value.split($thousand_separator).join('');
                $value = $value.split($decimal_seperator).join('.');
                $field_value = ($value) ? parseFloat($value) : 0;
            }

            var $value = $this.data('conditional-validation-value');
            var $value2 = $this.data('conditional-validation-value2');
            if(typeof $value !== 'undefined'){
                var $string_value = $value.toString();
                var $string_field_value = $field_value.toString();
                var $bracket = "{";
                if($string_value.indexOf($bracket) != -1){
                    var $form = $this.parents('.super-form:eq(0)');
                    var $regular_expression = /\{(.*?)\}/g;
                    var $name = $regular_expression.exec($value);
                    var $name = $name[1];
                    var $element = $form.find('.super-shortcode-field[name="'+$name+'"]');
                    if($element.length){
                        var $text_field = true;
                        var $parent = $element.parents('.super-field:eq(0)');
                        // Check if dropdown field
                        if( ($parent.hasClass('super-dropdown')) || ($parent.hasClass('super-countries')) ){
                            $text_field = false;
                            var $sum = 0;
                            var $selected = $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)');
                            $selected.each(function () {
                                $sum += $(this).data('value');
                            });
                            $value = $sum;
                        }
                        // Check if checkbox field
                        if($parent.hasClass('super-checkbox')){
                            $text_field = false;
                            var $sum = 0;
                            var $checked = $parent.find('input[type="checkbox"]:checked');
                            $checked.each(function () {
                                $sum += $(this).val();
                            });
                            $value = $sum;
                        }

                        // Check if currency field
                        if($parent.hasClass('super-currency')){
                            $text_field = false;
                            var $value = $element.val();
                            var $currency = $element.data('currency');
                            var $format = $element.data('format');
                            var $decimals = $element.data('decimals');
                            var $thousand_separator = $element.data('thousand-separator');
                            var $decimal_seperator = $element.data('decimal-separator');
                            $value = $value.replace($currency, '').replace($format, '');
                            $value = $value.split($thousand_separator).join('');
                            $value = $value.split($decimal_seperator).join('.');
                            $value = ($value) ? parseFloat($value) : 0;
                        }

                        // Check if text or textarea field
                        if($text_field==true){
                            $value = ($element.val()) ? $element.val() : '';
                        }
                    }
                }
            }

            if(typeof $value2 !== 'undefined'){
                var $string_value = $value2.toString();
                var $string_field_value = $field_value.toString();
                var $bracket = "{";
                if($string_value.indexOf($bracket) != -1){
                    var $form = $this.parents('.super-form:eq(0)');
                    var $regular_expression = /\{(.*?)\}/g;
                    var $name = $regular_expression.exec($value2);
                    var $name = $name[1];
                    var $element = $form.find('.super-shortcode-field[name="'+$name+'"]');
                    if($element.length){
                        var $text_field = true;
                        var $parent = $element.parents('.super-field:eq(0)');
                        // Check if dropdown field
                        if( ($parent.hasClass('super-dropdown')) || ($parent.hasClass('super-countries')) ){
                            $text_field = false;
                            var $sum = 0;
                            var $selected = $parent.find('.super-dropdown-ui li.super-active:not(.super-placeholder)');
                            $selected.each(function () {
                                $sum += $(this).data('value');
                            });
                            $value2 = $sum;
                        }
                        // Check if checkbox field
                        if($parent.hasClass('super-checkbox')){
                            $text_field = false;
                            var $sum = 0;
                            var $checked = $parent.find('input[type="checkbox"]:checked');
                            $checked.each(function () {
                                $sum += $(this).val();
                            });
                            $value2 = $sum;
                        }

                        // Check if currency field
                        if($parent.hasClass('super-currency')){
                            $text_field = false;
                            var $value2 = $element.val();
                            var $currency = $element.data('currency');
                            var $format = $element.data('format');
                            var $decimals = $element.data('decimals');
                            var $thousand_separator = $element.data('thousand-separator');
                            var $decimal_seperator = $element.data('decimal-separator');
                            $value2 = $value2.replace($currency, '').replace($format, '');
                            $value2 = $value2.split($thousand_separator).join('');
                            $value2 = $value2.split($decimal_seperator).join('.');
                            $value2 = ($value2) ? parseFloat($value2) : 0;
                        }

                        // Check if text or textarea field
                        if($text_field==true){
                            $value2 = ($element.val()) ? $element.val() : '';
                        }
                    }
                }
            }
            var $counter = 0;
            if($logic=='equal'){
                if($field_value==$value){
                    $counter++;
                }                            
            }
            if($logic=='not_equal'){
                if($field_value!=$value){
                    $counter++;
                }                            
            }
            if($logic=='contains'){
                if($field_value.indexOf($value) >= 0){
                    $counter++;
                }
            }

            $field_value = parseFloat($field_value);
            $value = parseFloat($value);
            $value2 = parseFloat($value2);
            
            if($logic=='greater_than'){
                if($field_value>$value){
                    $counter++;
                }                            
            }
            if($logic=='less_than'){
                if($field_value<$value){
                    $counter++;
                }                            
            }
            if($logic=='greater_than_or_equal'){
                if($field_value>=$value){
                    $counter++;
                }                            
            }
            if($logic=='less_than_or_equal'){
                if($field_value<=$value){
                    $counter++;
                }                            
            }

            // @since 3.6.0 - more specific conditional validation options
            // > && <
            // > || <
            if($logic=='greater_than_and_less_than'){
                if( ($field_value>$value) && ($field_value<$value2) ) {
                    $counter++;
                }                            
            }
            if($logic=='greater_than_or_less_than'){
                if( ($field_value>$value) || ($field_value<$value2) ) {
                    $counter++;
                }                            
            }

            // >= && <
            // >= || <
            if($logic=='greater_than_or_equal_and_less_than'){
                if( ($field_value>=$value) && ($field_value<$value2) ) {
                    $counter++;
                }                            
            }
            if($logic=='greater_than_or_equal_or_less_than'){
                if( ($field_value>=$value) || ($field_value<$value2) ) {
                    $counter++;
                }                            
            }

            // > && <=
            // > || <=
            if($logic=='greater_than_and_less_than_or_equal'){
                if( ($field_value>$value) && ($field_value<=$value2) ) {
                    $counter++;
                }                            
            }
            if($logic=='greater_than_or_less_than_or_equal'){
                if( ($field_value>$value) || ($field_value<=$value2) ) {
                    $counter++;
                }                            
            }

            // >= && <=
            // >= || <=
            if($logic=='greater_than_or_equal_and_less_than_or_equal'){
                if( ($field_value>=$value) && ($field_value<=$value2) ) {
                    $counter++;
                }                            
            }
            if($logic=='greater_than_or_equal_or_less_than_or_equal'){
                if( ($field_value>=$value) || ($field_value<=$value2) ) {
                    $counter++;
                }                            
            }
            
            if($counter==0){
                $error = true;
            }
        }

        // @since 4.3.0 - extra validation check for files
        if($this.hasClass('super-fileupload')){
            var $file_error = false;
            var $attr = $this.parent().find('.super-active-files').data('minfiles');
            if (typeof $attr !== 'undefined' && $attr !== false) {
                var $total = $this.parent().find('.super-fileupload-files').children('div').length;
                if($total < $attr) {
                    $error = true;
                }
            }
            var $attr = $this.parent().find('.super-active-files').data('maxfiles');
            if (typeof $attr !== 'undefined' && $attr !== false) {
                var $total = $this.parent().find('.super-fileupload-files').children('div').length;
                if($total > $attr) {
                    $error = true;
                }
            }
        }

        if($error==true){
            SUPER.handle_errors($this, $duration);
            var $index = $this.parents('.super-multipart:eq(0)').index('.super-form:eq(0) .super-multipart');
            $this.parents('.super-form:eq(0)').find('.super-multipart-steps').children('.super-multipart-step:eq('+$index+')').addClass('super-error');
        }else{
            $this.parents('.super-field:eq(0)').removeClass('error-active');
            $this.parents('.super-field:eq(0)').children('p').fadeOut($duration, function() {
                $(this).remove();
            });
        }
        
        if($this.parents('.super-multipart:eq(0)').find('.super-field > p').length==0){
            var $index = $this.parents('.super-multipart:eq(0)').index('.super-form:eq(0) .super-multipart');
            $this.parents('.super-form:eq(0)').find('.super-multipart-steps').children('.super-multipart-step:eq('+$index+')').removeClass('super-error');
        }
        return $error;
    }

    // Custom error theme
    SUPER.custom_theme_error = function($form, $this){
        if($form.find('input[name="hidden_theme"]').length != 0){
            var $theme_options = $form.find('input[name="hidden_theme"]').data();
            $this.attr('style', 'background-color:'+$theme_options['error_bg']+';border-color:'+$theme_options['error_border']+';color:'+$theme_options['error_font']);
        }        
    }

    // Get the error duration (for fades)
    SUPER.get_duration = function($form){
        if($form.find('input[name="hidden_duration"]').length == 0){
            var $duration = parseFloat(super_common_i18n.duration);
        }else{
            var $duration = parseFloat($form.find('input[name="hidden_duration"]').val());
        }
        return $duration;
    }

    // Output errors for each field
    SUPER.handle_errors = function($this, $duration){
        var $error_position = $this.parents('.super-field:eq(0)');
        var $position = 'after';
        if(($error_position.hasClass('top-left')) || ($error_position.hasClass('top-right'))){
            var $position = 'before';
        }
        if ($this.data('message')){
            var $message = $this.data('message');
        }else{
            var $message = super_common_i18n.errors.fields.required;
        }
        if ($this.parents('.super-field:eq(0)').children('p').length == 0) {
            var $element = $this.parents('.super-field-wrapper:eq(0)');
            if($this.hasClass('super-recaptcha')){
                var $element = $this;
            }
            if($position=='before'){
                $('<p style="display:none;">' + $message + '</p>').insertBefore($element);
            }
            if($position=='after'){
                $('<p style="display:none;">' + $message + '</p>').appendTo($element.parents('.super-field:eq(0)'));
            }
        }
        if(($this.parents('.super-field').next('.grouped').length != 0) || ($this.parents('.super-field').hasClass('grouped'))){
            $this.parent().children('p').css('max-width', $this.parent().outerWidth()+'px');
        }
        SUPER.custom_theme_error($this.parents('.super-form'), $this.parent().children('p'));
        $this.parents('.super-field:eq(0)').addClass('error-active');
        $this.parents('.super-field:eq(0)').children('p').fadeIn($duration);
    }

    // Validate the form
    SUPER.validate_form = function( $form, $submit_button, $validate_multipart, e ) {
        
        // @since 2.0.0 - clear the form action
        var $action = $submit_button.children('.super-button-name').data('action');
        if($action=='clear'){
            SUPER.init_clear_form($form);
            return false;
        }

        // @since 3.1.0 - print form data
        if($action=='print'){
            SUPER.init_print_form($form, $submit_button);
            return false;
        }

        var $url = $submit_button.data('href');
        

        // @since 1.9
        var $proceed = SUPER.before_submit_button_click_hook(e, $submit_button);

        if($proceed==true){
            if( ($url!='') && (typeof $url !== 'undefined') ){
                var $regular_expression = /\{(.*?)\}/g;
                var $array = [];
                var $i = 0;
                while (($match = $regular_expression.exec($url)) != null) {
                    $array[$i] = $match[1];
                    $i++;
                }
                for (var $i = 0; $i < $array.length; $i++) {
                    var $name = $array[$i];
                    var $element = $form.find('.super-shortcode-field[name="'+$name+'"]');
                    if($element.length){
                        $value = $element.val();
                        $url = $url.replace('{'+$name+'}', $value);
                        
                    }
                }
                $url = $url.replace('{', '').replace('}', '');
                if( $url=='#' ) {
                    return false;
                }else{
                    var $target = $submit_button.data('target');
                    if( ($target!=='undefined') && ($target=='_blank') ) {
                        window.open( $url, '_blank' );
                    }else{
                        window.location.href = $url;
                    }
                    return false;
                }
            }else{
                if($submit_button.parent('.super-form-button').hasClass('super-loading')){
                    return false;
                }
            }
        }


        // @since 2.0 - multipart validation
        if(typeof $validate_multipart === 'undefined') $validate_multipart = '';

        SUPER.before_validating_form_hook(undefined, $form);
        var $data = [],
            $error = false;
        var $duration = SUPER.get_duration($form);

        // @since 1.2.4     make sure the text editor saves content to it's textarea
        if( typeof tinyMCE !== 'undefined' ) {
            if( typeof tinyMCE.triggerSave !== 'undefined' ) {
                tinyMCE.triggerSave();
            }
        }

        $form.find('.super-field').find('.super-shortcode-field, .super-recaptcha, .super-active-files').each(function () {
            var $hidden = false;
            var $this = $(this);
            $this.parents('.super-shortcode.super-column').each(function(){
                if($(this).css('display')=='none'){
                    $hidden = true;
                }
            });
            var $parent = $this.parents('.super-shortcode:eq(0)');
            if( ( $hidden==true )  || ( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) ) {
                // Exclude conditionally
            }else{
                var $text_field = true;
                if($this.hasClass('super-recaptcha')){
                    $text_field = false;
                    if($this.data('verified')!=1){
                        if (SUPER.handle_validations($this, 'captcha', '', $duration)) {
                            $error = true;
                        }
                    }
                }
                if($this.hasClass('super-active-files')){
                    $text_field = false;
                    var $file_error = false;
                    var $attr = $this.data('minfiles');
                    if (typeof $attr !== 'undefined' && $attr !== false) {
                        var $total = $this.parent().find('.super-fileupload-files').children('div').length;
                        if($total < $attr) {
                            $file_error = true;
                        }
                    }
                    var $attr = $this.data('maxfiles');
                    if (typeof $attr !== 'undefined' && $attr !== false) {
                        var $total = $this.parent().find('.super-fileupload-files').children('div').length;
                        if($total > $attr) {
                            $file_error = true;
                        }
                    }
                    if($file_error==true){
                        $error = true;
                        SUPER.handle_errors($this, $duration);
                        var $index = $this.parents('.super-multipart:eq(0)').index('.super-form:eq(0) .super-multipart');
                        $this.parents('.super-form:eq(0)').find('.super-multipart-steps').children('.super-multipart-step:eq('+$index+')').addClass('super-error');
                    }else{
                        $this.parents('.super-field:eq(0)').removeClass('error-active');
                        $this.parents('.super-field:eq(0)').children('p').fadeOut($duration, function() {
                            $(this).remove();
                        });
                    }
                    if($this.parents('.super-multipart:eq(0)').find('.super-field > p').length==0){
                        var $index = $this.parents('.super-multipart:eq(0)').index('.super-form:eq(0) .super-multipart');
                        $this.parents('.super-form:eq(0)').find('.super-multipart-steps').children('.super-multipart-step:eq('+$index+')').removeClass('super-error');
                    }
                }
                if($text_field==true){
                    var $validation = $this.data('validation');
                    var $conditional_validation = $this.data('conditional-validation');
                    if (SUPER.handle_validations($this, $validation, $conditional_validation, $duration)) {
                        $error = true;
                    }
                }
            }
        });
        if($error==false){  
            
            // @since 2.0.0 - multipart validation
            if($validate_multipart==true) return true;

            var $submit_button_name = $submit_button.children('.super-button-name');

            $submit_button.parents('.super-form-button:eq(0)').addClass('super-loading');
            var $old_html = $submit_button_name.html();

            // @since 2.0.0 - submit button loading state name
            var $loading = $submit_button.children('.super-button-name').data('loading');
            if(super_common_i18n.loading!='Loading...') {
                $loading = super_common_i18n.loading;
            }
            
            // @since 3.4.0 - entry statuses
            var $status = $submit_button_name.data('status');
            var $status_update = $submit_button_name.data('status-update');

            $submit_button_name.html('<i class="fa fa-refresh fa-spin"></i>'+$loading);
            if ($form.find('.super-fileupload-files > div').length != 0) {
                SUPER.upload_files( $form, $data, $duration, $old_html, $status, $status_update );
            }else{
                SUPER.complete_submit( $form, $duration, $old_html, $status, $status_update );
            }
        }else{
            
            // @since 2.0 - multipart validation
            if($validate_multipart==true) {
                var $scroll = true;
                if(typeof $form.attr('data-disable-scroll') !== 'undefined'){
                    $scroll = false;
                }
                if($scroll){
                    $('html, body').animate({
                        scrollTop: $form.parents('.super-form:eq(0)').offset().top-30
                    }, 1000);
                }
                return false;
            }

            if($form.find('.super-multipart-step.super-error').length){
                var $this = $form.find('.super-multipart-step.super-error:eq(0)');
                var $index = $this.index();
                var $total = $form.find('.super-multipart').length;
                var $progress = 100 / $total;
                var $progress = $progress * ($index+1);
                var $multipart = $form.find('.super-multipart:eq('+$index+')');
                var $scroll = true;
                if(typeof $multipart.attr('data-disable-scroll') !== 'undefined'){
                    $scroll = false;
                }
                $form.find('.super-multipart-progress-bar').css('width',$progress+'%');
                $form.find('.super-multipart-step').removeClass('active');
                $form.find('.super-multipart').removeClass('active');
                $multipart.addClass('active');
                $this.addClass('active');

                // @since 2.1.0
                var $proceed = SUPER.before_scrolling_to_error_hook($form, $form.offset().top - 30);
                if($proceed!=true) return false;

                // @since 4.2.0 - disable scrolling when multi-part contains errors
                if($scroll){
                    $('html, body').animate({
                        scrollTop: $this.parents('.super-form:eq(0)').offset().top - 30 
                    }, 1000);
                }
            }else{
                // @since 2.1.0
                var $proceed = SUPER.before_scrolling_to_error_hook($form, $form.find('.super-field > p').offset().top-200);
                if($proceed!=true) return false;

                $('html, body').animate({
                    scrollTop: $form.find('.super-field > p').offset().top-200
                }, 1000);

            }
        }
        SUPER.after_validating_form_hook(undefined, $form);
    }

    // @since 1.2.3
    SUPER.auto_step_multipart = function($field){
        var $form = $field.parents('.super-form:eq(0)');
        var $active_part = $form.find('.super-multipart.active');
        var $auto_step = $active_part.data('step-auto');
        if( $auto_step=='yes') {
            var $total_fields = 0;
            $active_part.find('.super-shortcode-field').each(function(){
                var $this = $(this);
                var $hidden = false;
                $this.parents('.super-shortcode.super-column').each(function(){
                    if($(this).css('display')=='none'){
                        $hidden = true;
                    }
                });
                var $parent = $this.parents('.super-shortcode:eq(0)');
                if( ($hidden==true)  || ($parent.css('display')=='none') ) {
                    // Exclude conditionally
                }else{
                    $total_fields++;
                }
            });
            var $counter = 1;
            $active_part.find('.super-shortcode-field').each(function(){
                var $this = $(this);
                var $hidden = false;
                $this.parents('.super-shortcode.super-column').each(function(){
                    if($(this).css('display')=='none'){
                        $hidden = true;
                    }
                });
                var $parent = $this.parents('.super-shortcode:eq(0)');
                if( ($hidden==true)  || ($parent.css('display')=='none') ) {
                    // Exclude conditionally
                }else{
                    if($total_fields==$counter){
                        if($this.attr('name')==$field.attr('name')){
                            setTimeout(function (){
                                $active_part.find('.super-next-multipart').click();
                            }, 200);
                        }
                    }
                    $counter++;
                }
            });
        }
    }

    // Define Javascript Hooks
    SUPER.before_validating_form_hook = function($changed_field, $form){
        var $functions = super_common_i18n.dynamic_functions.before_validating_form_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($changed_field, $form);
            }
        });
    }
    SUPER.after_validating_form_hook = function($changed_field, $form){
        var $functions = super_common_i18n.dynamic_functions.after_validating_form_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($changed_field, $form);
            }
        });
    }
    SUPER.after_initializing_forms_hook = function($changed_field, $form, callback){
        var $functions = super_common_i18n.dynamic_functions.after_initializing_forms_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($changed_field, $form);
            }
        });
        callback($form);
    }

    // @since 3.6.0 - function to retrieve either the form element in back-end preview mode or on front-end
    SUPER.get_frontend_or_backend_form = function(){
        if($('.super-live-preview').length) {
            return $('.super-live-preview');
        }else{
            return $(document);
        }
    }

    SUPER.after_dropdown_change_hook = function($field, $form, $skip){
        if( typeof $field !== 'undefined' ) {
            var $form = $field.parents('.super-form:eq(0)');
        }else{
            var $form = SUPER.get_frontend_or_backend_form();
        }
        var $functions = super_common_i18n.dynamic_functions.after_dropdown_change_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($field, $form);
            }
        });
        if( typeof $field !== 'undefined'  && ($skip!=true) ) {
            SUPER.auto_step_multipart($field);
        }
        SUPER.save_form_progress($form); // @since 3.2.0
    }
    SUPER.after_field_change_blur_hook = function($field, $form, $skip){
        if( (typeof $field !== 'undefined') && ($skip!=false) ) {
            var $form = $field.parents('.super-form:eq(0)');
        }else{
            var $form = SUPER.get_frontend_or_backend_form();
        }
        var $functions = super_common_i18n.dynamic_functions.after_field_change_blur_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($field, $form, $skip);
            }
        });
        if( typeof $field !== 'undefined'  && ($skip!=true) ) {
            SUPER.auto_step_multipart($field);
        }
        SUPER.save_form_progress($form);
    }
    SUPER.after_radio_change_hook = function($field, $form, $skip){
        if( typeof $field !== 'undefined' ) {
            var $form = $field.parents('.super-form:eq(0)');
        }else{
            var $form = SUPER.get_frontend_or_backend_form();      
        }
        var $functions = super_common_i18n.dynamic_functions.after_radio_change_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($field, $form);
            }
        });
        if( typeof $field !== 'undefined'  && ($skip!=true) ) {
            SUPER.auto_step_multipart($field);
        }
        SUPER.save_form_progress($form); // @since 3.2.0
    }
    SUPER.after_checkbox_change_hook = function($field, $form, $skip){
        if( typeof $field !== 'undefined' ) {
            var $form = $field.parents('.super-form:eq(0)');
        }else{
            var $form = SUPER.get_frontend_or_backend_form();
        }
        var $functions = super_common_i18n.dynamic_functions.after_checkbox_change_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($field, $form);
            }
        });
        if( typeof $field !== 'undefined'  && ($skip!=true) ) {
            SUPER.auto_step_multipart($field);
        }
        SUPER.save_form_progress($form); // @since 3.2.0
    }

    // @since 3.2.0 - save form progress
    SUPER.save_form_progress_timeout = null; 
    SUPER.save_form_progress = function($form){
        if( !$form.hasClass('super-save-progress') ) {
            return false;
        }
        if(SUPER.save_form_progress_timeout !== null){
            clearTimeout(SUPER.save_form_progress_timeout);
        }
        SUPER.save_form_progress_timeout = setTimeout(function () {
            var $data = SUPER.prepare_form_data($form);
            var $form_id = $data.form_id;
            var $data = SUPER.after_form_data_collected_hook($data.data);
            $.ajax({
                url: super_common_i18n.ajaxurl,
                type: 'post',
                data: {
                    action: 'super_save_form_progress',
                    data: $data,
                    form_id: $form_id
                }
            });
        }, 300);
    }

    // @since 1.2.8 
    SUPER.after_email_send_hook = function($form){

        // @since 3.6.0 - google tracking
        var ga = window[window['GoogleAnalyticsObject'] || 'ga'];
        if (typeof ga == 'function') {
            var $ga_tracking = super_common_i18n.ga_tracking;
            var $ga_tracking = $ga_tracking.split('\n');
            $($ga_tracking).each(function(index, value){
                
                // Check if this is a global event or for a specific form (based on form ID):
                var $proceed = true;
                var $values = value.split(":");
                if($values.length>1){
                    var $event = $values[1].split("|");
                    if(!$form.hasClass('super-form-'+$values[0])){
                        $proceed = false;
                    }
                }else{
                    var $event = $values[0].split("|");
                }

                // Only proceed if this was an event that needs to be executed globally, or if the ID matches the submitted form
                if($proceed){
                    if( ( (typeof $event[1] === 'undefined') || ($event[1]=='') ) || 
                        ( (typeof $event[2] === 'undefined') || ($event[2]=='') ) ) {
                        console.log('Seems like we are missing required ga() parameters!');
                    }else{

                        // Event Tracking
                        if( ($event[0]=='send') && ($event[1]=='event') ) {
                            if( (typeof $event[3] === 'undefined') || ($event[3]=='') ) {
                                console.log('ga() is missing the "eventAction" parameter (The type of interaction e.g. "play")');
                            }else{
                                var $parameters = {};
                                $parameters.hitType = $event[1];
                                $parameters.eventCategory = $event[2];
                                $parameters.eventAction = $event[3];
                                if( typeof $event[4] !== 'undefined' ) {
                                    $parameters.eventLabel = $event[4];
                                }
                                if( typeof $event[5] !== 'undefined' ) {
                                    $parameters.eventValue = $event[5];
                                }
                                ga($event[0], $parameters);
                            }
                        }

                        /* (the following might be usefull for near future?)
                        // Page Tracking (maybe used in future?)
                        if( ($event[0]=='send') && ($event[1]=='pageview') ) {
                            ga($event);
                        }
                        // Social Interactions
                        if( ($event[0]=='send') && ($event[1]=='social') ) {
                            if( ( (typeof $event[3] === 'undefined') || ($event[3]=='') ) || 
                                ( (typeof $event[4] === 'undefined') || ($event[4]=='') ) ) {
                                console.log('ga() is missing the "socialAction" parameter (The type of action that happens e.g. "Like", "Send", "Tweet".)');
                                console.log('ga() is missing the "socialTarget" parameter (Specifies the target of a social interaction. This value is typically a URL but can be any text. e.g. "http://mycoolpage.com")');
                            }else{
                                ga($event);
                            }
                        }
                        */
                    }
                }

            });
        }else{
            console.log('Could not submit tracking event because ga() is not a function. This means the analytics.js library is not loaded correctly.');
        }

        /*
        ga('send', {
          hitType: 'event',
          eventCategory: 'Signup Form',
          eventAction: 'submit',
          eventLabel: 'Fall Campaign'
        });


        // Example tracking event:
        /*
        ga('send', {
          hitType: 'event',
          eventCategory: 'Signup Form',
          eventAction: 'submit',
          eventLabel: 'Fall Campaign'
        });
        */
        // command: send

        var $functions = super_common_i18n.dynamic_functions.after_email_send_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($form);
            }
        });    
    }

    // @since 1.3
    SUPER.after_responsive_form_hook = function($classes, $new_class, $window_classes, $new_window_class){
        var $functions = super_common_i18n.dynamic_functions.after_responsive_form_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($classes, $new_class, $window_classes, $new_window_class);
            }
        });    
    }

    // Grab fields data and return all data as an object
    SUPER.prepare_form_data_fields = function($form){
        var $data = {};
        $form.find('.super-shortcode-field').each(function(){
            var $this = $(this);
            var $hidden = false;

            $this.parents('.super-shortcode.super-column').each(function(){
                if($(this).css('display')=='none'){
                    $hidden = true;
                }
            });
            var $parent = $this.parents('.super-shortcode:eq(0)');
            if( ( $hidden==true )  || ( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) ) {
                // Exclude conditionally
            }else{
                if($this.hasClass('super-fileupload')){
                    var $parent = $this.parents('.super-field-wrapper:eq(0)');
                    var $field = $parent.find('.super-active-files');                
                    var $files = $parent.find('.super-fileupload-files > div');
                    $data[$field.attr('name')] = {
                        'label':$field.data('email'),
                        'type':'files',
                        'exclude':$field.data('exclude'),
                        'exclude_entry':$field.data('exclude-entry'),
                        'files':{}};
                    $files.each(function(index,file){
                        var file = $(this);
                        $data[$field.attr('name')]['files'][index] = { 
                            'name':$field.attr('name'),
                            'value':file.attr('data-name'),
                            'url':file.attr('data-url'),
                            'thumburl':file.attr('data-thumburl'),
                            'label':$field.data('email'),
                            'exclude':$field.data('exclude'),
                            'exclude_entry':$field.data('exclude-entry'),
                            'excludeconditional':$field.data('excludeconditional'),
                        };
                    });
                }else{
                    $data[$this.attr('name')] = { 
                        'name':$this.attr('name'),
                        'value':$this.val(),
                        'label':$this.data('email'),
                        'exclude':$this.data('exclude'),
                        'replace_commas':$this.data('replace-commas'),
                        'exclude_entry':$this.data('exclude-entry'),
                        'excludeconditional':$this.data('excludeconditional'),
                        'type':'var'
                    };

                    var $super_field = $this.parents('.super-field:eq(0)');

                    if($super_field.hasClass('super-textarea')){
                        $data[$this.attr('name')]['type'] = 'text';
                    }

                    // @since 3.2.0 - also save lat and lng for ACF google maps compatibility
                    if($this.hasClass('super-address-autopopulate')){
                        $data[$this.attr('name')]['type'] = 'google_address';
                        $data[$this.attr('name')]['geometry'] = {
                            location: {
                                'lat':$this.data('lat'),
                                'lng':$this.data('lng'),
                            }
                        }
                    }
                    
                    // @since 2.2.0 - generate unique code (make sure to save it after form completion)
                    if($super_field.hasClass('super-hidden')){
                        if($this.data('code')==true) {
                            $data[$this.attr('name')]['code'] = 'true';
                            if($this.attr('data-invoice-padding')){
                                $data[$this.attr('name')]['invoice_padding'] = $this.attr('data-invoice-padding');
                            }
                        }
                    }

                    // @since 3.6.0 - replace correct data value for autosuggest fields
                    // @since 4.6.0 - replace correct data value for wc order search
                    if( $super_field.hasClass('super-auto-suggest') || $super_field.hasClass('super-wc-order-search') ) {
                        var $value = $super_field.find('.super-field-wrapper .super-dropdown-ui > .super-active').attr('data-value');
                        if( typeof $value !== 'undefined' ) {
                            // Also make sure to always save the first value
                            $data[$this.attr('name')]['value'] = $value.split(";")[0];
                        }
                    }

                    if( $super_field.hasClass('super-dropdown') ) {
                        var $i = 0;
                        var $new_value = '';
                        var $selected_items = $super_field.find('.super-field-wrapper .super-dropdown-ui > .super-active');
                        $selected_items.each(function(){
                            if($i==0){
                                $new_value += $(this).text();
                                if($this.data('admin-email-value')=='both') {
                                    $new_value += ' ('+$(this).data('value')+')';
                                }
                            }else{
                                $new_value += ', '+$(this).text();
                                if($this.data('admin-email-value')=='both') {
                                    $new_value += ' ('+$(this).data('value')+')';
                                }
                            }
                            $i++;
                        });
                        $data[$this.attr('name')]['option_label'] = $new_value;

                        if( ($this.data('admin-email-value')=='label') || ($this.data('admin-email-value')=='both') ) {
                            $data[$this.attr('name')]['admin_value'] = $new_value; 
                        }else{
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).data('value').toString().split(';');
                                if($i==0){
                                    $new_value += $item_value[0];
                                }else{
                                    $new_value += ', '+$item_value[0];
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['value'] = $new_value; 
                        }
                        var $email_value = $this.data('confirm-email-value');
                        if( ($email_value=='label') || ($email_value=='both') ) {
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).data('value').toString().split(';');
                                if($i==0){
                                    $new_value += $(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }else{
                                    $new_value += ', '+$(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['confirm_value'] = $new_value; 
                        }
                        var $email_value = $this.data('contact-entry-value');
                        if( ($email_value=='label') || ($email_value=='both') ) {
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).data('value').toString().split(';');
                                if($i==0){
                                    $new_value += $(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }else{
                                    $new_value += ', '+$(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['entry_value'] = $new_value; 
                        }
                    }
                    if( $super_field.hasClass('super-checkbox') || $super_field.hasClass('super-radio') ) {
                        var $i = 0;
                        var $new_value = '';
                        var $selected_items = $super_field.find('.super-field-wrapper .super-active');
                        $selected_items.each(function(){
                            var $item_value = $(this).find('input').val().toString().split(';');
                            if($i==0){
                                $new_value += $(this).text();
                                if($this.data('admin-email-value')=='both') {
                                    $new_value += ' ('+$item_value[0]+')';
                                }
                            }else{
                                $new_value += ', '+$(this).text();
                                if($this.data('admin-email-value')=='both') {
                                    $new_value += ' ('+$item_value[0]+')';
                                }
                            }
                            $i++;
                        });
                        $data[$this.attr('name')]['option_label'] = $new_value;

                        if( ($this.data('admin-email-value')=='label') || ($this.data('admin-email-value')=='both') ) {
                            $data[$this.attr('name')]['admin_value'] = $new_value; 
                        }else{
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).find('input').val().toString().split(';');
                                if($i==0){
                                    $new_value += $item_value[0];
                                }else{
                                    $new_value += ','+$item_value[0];
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['value'] = $new_value; 
                        }
                        var $email_value = $this.data('confirm-email-value');
                        if( ($email_value=='label') || ($email_value=='both') ) {
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).find('input').val().toString().split(';');
                                if($i==0){
                                    $new_value += $(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }else{
                                    $new_value += ', '+$(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['confirm_value'] = $new_value; 
                        }
                        var $email_value = $this.data('contact-entry-value');
                        if( ($email_value=='label') || ($email_value=='both') ) {
                            var $i = 0;
                            var $new_value = '';
                            $selected_items.each(function(){
                                var $item_value = $(this).find('input').val().toString().split(';');
                                if($i==0){
                                    $new_value += $(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }else{
                                    $new_value += ', '+$(this).text();
                                    if($email_value=='both') {
                                        $new_value += ' ('+$item_value[0]+')';
                                    }
                                }
                                $i++;
                            });
                            $data[$this.attr('name')]['entry_value'] = $new_value; 
                        }
                    }

                    // @since 2.9.0 - keywords
                    if( $this.hasClass('super-keyword') ) {
                        var $parent = $this.parent().find('.super-entered-keywords');
                        var $tags = '';
                        var $counter = 0;
                        $parent.children('span').each(function(){
                            if($counter==0){
                                $tags += $(this).text();
                            }else{
                                $tags += ', '+$(this).text();
                            }
                            $counter++;
                        });
                        $data[$this.attr('name')]['value'] = $tags; 
                    }

                    // @since 3.7.0 - autosuggest tags
                    if( $super_field.hasClass('super-keyword-tags') ) {
                        var $i = 0;
                        var $new_value = '';
                        $super_field.find('.super-autosuggest-tags > div > span').each(function(){
                            if($i==0){
                                $new_value += $(this).data('value');
                            }else{
                                $new_value += ','+$(this).data('value');
                            }
                            $i++;
                        });
                        $data[$this.attr('name')]['value'] = $new_value; 
                    }

                }
            }
        });
        return $data;
    }

    // @since 3.2.0 - prepare form data
    SUPER.prepare_form_data = function($form){
        var $data = SUPER.prepare_form_data_fields($form),
            $form_id = '',
            $entry_id = '',
            $dynamic_columns = {},
            $dynamic_arrays = [],
            $first_property_name;
        
        // Loop through all dynamic columns and create an JSON string based on all the fields
        $form.find('.super-column[data-duplicate_limit]').each(function(){
            $first_property_name = undefined;
            $(this).find('.super-duplicate-column-fields').each(function(){
                $dynamic_column_fields_data = SUPER.prepare_form_data_fields($(this));
                if(typeof $first_property_name === 'undefined'){
                    $first_property_name = Object.getOwnPropertyNames($dynamic_column_fields_data)[0];
                }
                $dynamic_arrays.push($dynamic_column_fields_data);
            });
            if($first_property_name!==undefined){
                $dynamic_columns[$first_property_name] = $dynamic_arrays;
            }
        });
        if(Object.keys($dynamic_columns).length>0){
            $data['_super_dynamic_data'] = JSON.stringify($dynamic_columns);
        }
        if($form.find('input[name="hidden_form_id"]').length != 0) {
            $form_id = $form.find('input[name="hidden_form_id"]').val();
        }
        $data['hidden_form_id'] = { 
            'name':'hidden_form_id',
            'value':$form_id,
            'type':'form_id'
        };

        // @since 2.2.0 - update contact entry by ID
        if($form.find('input[name="hidden_contact_entry_id"]').length != 0) {
            $entry_id = $form.find('input[name="hidden_contact_entry_id"]').val();
        }
        $data['hidden_contact_entry_id'] = { 
            'name':'hidden_contact_entry_id',
            'value':$entry_id,
            'type':'entry_id'
        };
        return {data:$data, form_id:$form_id, entry_id:$entry_id};
    }

    // @since 1.3
    SUPER.after_form_data_collected_hook = function($data){
        var $functions = super_common_i18n.dynamic_functions.after_form_data_collected_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                $data = SUPER[value.name]($data);
            }
        });
        return $data;
    }

    // @since 1.3
    SUPER.after_duplicate_column_fields_hook = function($this, $field, $counter, $column, $field_names, $field_labels){
        var $functions = super_common_i18n.dynamic_functions.after_duplicate_column_fields_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($this, $field, $counter, $column, $field_names, $field_labels);
            }
        });
    }

    // @since 3.3.0
    SUPER.after_appending_duplicated_column_hook = function($form, $unique_field_names, $clone){
        var $functions = super_common_i18n.dynamic_functions.after_appending_duplicated_column_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($form, $unique_field_names, $clone);
            }
        });
    }

    // @since 2.4.0
    SUPER.after_duplicating_column_hook = function($form, $unique_field_names, $clone){
        var $functions = super_common_i18n.dynamic_functions.after_duplicating_column_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($form, $unique_field_names, $clone);
            }
        });
    }

    // @since 1.9
    SUPER.before_submit_button_click_hook = function(e, $this){
        var $proceed = true;
        var $functions = super_common_i18n.dynamic_functions.before_submit_button_click_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                $proceed = SUPER[value.name](e, $proceed, $this);
            }
        });
        return $proceed;
    }
    SUPER.after_preview_loaded_hook = function($form_id){
        var $functions = super_common_i18n.dynamic_functions.after_preview_loaded_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($form_id);
            }
        });
    }

    // @since 2.0.0
    SUPER.after_form_cleared_hook = function($form){
        var $functions = super_common_i18n.dynamic_functions.after_form_cleared_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                SUPER[value.name]($form);
            }
        });
    }

    // @since 2.1.0
    SUPER.before_scrolling_to_error_hook = function($form, $scroll){
        var $proceed = true;
        var $functions = super_common_i18n.dynamic_functions.before_scrolling_to_error_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                $proceed = SUPER[value.name]($proceed, $form, $scroll);
            }
        });
        return $proceed;
    }
    SUPER.before_scrolling_to_message_hook = function($form, $scroll){
        var $proceed = true;
        var $functions = super_common_i18n.dynamic_functions.before_scrolling_to_message_hook;
        jQuery.each($functions, function(key, value){
            if(typeof SUPER[value.name] !== 'undefined') {
                $proceed = SUPER[value.name]($proceed, $form, $scroll);
            }
        });
        return $proceed;
    }

    // @since 3.0.0 - google maps API for places auto complete/populate and other libraries such as:
    
    // drawing provides a graphical interface for users to draw polygons, rectangles, polylines, circles, and markers on the map. 
    // Consult the Drawing library documentation for more information.

    // geometry includes utility functions for calculating scalar geometric values (such as distance and area) on the surface of the earth. 
    // Consult the Geometry library documentation for more information.

    // places enables your application to search for places such as establishments, geographic locations, or prominent points of interest, within a defined area.
    // Consult the Places library documentation for more information.

    // visualization provides heatmaps for visual representation of data.
    // Consult the Visualization library documentation for more information.


    SUPER.google_maps_api = function(){};
    SUPER.google_maps_init = function($changed_field, $form){
        if(typeof $form === 'undefined'){
            var $form = SUPER.get_frontend_or_backend_form();
        }
        if($form.hasClass('super-multipart')){
            var $form = $form.parents('.super-form:eq(0)');
        }

        // @since 3.0.0
        SUPER.google_maps_api.initAutocomplete($changed_field, $form);

        // @since 3.5.0
        SUPER.google_maps_api.initMaps($changed_field, $form);

    }

    // @since 3.5.0 - function for intializing google maps elements
    SUPER.google_maps_api.initMaps = function($changed_field, $form){

        if(typeof $changed_field === 'undefined') {
            $maps = $form.find('.super-google-map');
        }else{
            var $form = $changed_field.parents('.super-form:eq(0)');
            $maps = $form.find('.super-google-map[data-fields*="['+$changed_field.attr('name')+']"]');
        }

        // Loop through maps
        $maps.each(function(){
            $data = $(this).children('textarea').val();
            var $data = jQuery.parseJSON($data);
            var $form_id = $form.find('input[name="hidden_form_id"]').val();
            var $zoom = parseFloat($data.zoom);
            var $address = $data.address;
            var $address_marker = $data.address_marker;
            var $polyline_stroke_weight = $data.polyline_stroke_weight;
            var $polyline_stroke_color = $data.polyline_stroke_color;
            var $polyline_stroke_opacity = $data.polyline_stroke_opacity;
            var $polyline_geodesic = $data.polyline_geodesic;

            var map = new google.maps.Map(document.getElementById('super-google-map-'+$form_id), {
              zoom: $zoom
              //mapTypeId: \'terrain\'
            });

            // Draw Polylines
            var $center_based_on_address = true;
            if( $data.enable_polyline=='true' ) {
                var $polylines = $data.polylines.split('\n');
                var $Coordinates = [];
                var $lat_min = '',
                    $lat_max = '',
                    $lng_min = '',
                    $lng_max = '';
                $($polylines).each(function(index, value){
                    $coordinates = value.split("|");
                    var $lat = $coordinates[0];
                    var $lng = $coordinates[1];

                    // If {tag} was found
                    var $regular_expression = /\{(.*?)\}/g;
                    if($regular_expression.exec($lat)!=null){
                        var $field_name = $lat.replace('{','').replace('}','');
                        var $field = $form.find('.super-shortcode-field[name="'+$field_name+'"]');
                        $lat = $form.find('.super-shortcode-field[name="'+$field_name+'"]').attr('data-lat');
                        if(typeof $lat === 'undefined'){
                            $lat = 0;
                        }
                    }
                    var $regular_expression = /\{(.*?)\}/g;
                    if($regular_expression.exec($lng)!=null){
                        var $field_name = $lng.replace('{','').replace('}','');
                        var $field = $form.find('.super-shortcode-field[name="'+$field_name+'"]');
                        $lng = $form.find('.super-shortcode-field[name="'+$field_name+'"]').attr('data-lng');
                        if(typeof $lng === 'undefined'){
                            $lng = 0;
                        }
                    }
                    var $lat = parseFloat($lat);
                    var $lng = parseFloat($lng);

                    // Add markers at each point
                    if( $lat!=0 && $lng!=0 ) {
                        var marker = new google.maps.Marker({
                            position: {lat: $lat, lng: $lng},
                            map: map
                        });
                    }

                    $Coordinates.push({lat: $lat, lng: $lng});
                    if( $lat_min=='' ) {
                        $lat_min = $lat;
                        $lat_max = $lat;
                        $lng_min = $lng;
                        $lng_max = $lng;
                    } 
                    if($lat_min>$lat) $lat_min = $lat;
                    if($lat_max<$lat) $lat_max = $lat;
                    if($lng_min>$lng) $lng_min = $lng;
                    if($lng_max<$lng) $lng_max = $lng;
                });
                if( $lat_min==0 || $lat_max==0 || $lng_min==0 || $lng_max==0 ) {
                    map.setCenter(new google.maps.LatLng(
                        (($lat_max + $lat_min) / 2.0),
                        (($lng_max + $lng_min) / 2.0)
                    ));                    
                }else{
                    $center_based_on_address = false;
                    map.setCenter(new google.maps.LatLng(
                        (($lat_max + $lat_min) / 2.0),
                        (($lng_max + $lng_min) / 2.0)
                    ));
                    map.fitBounds(new google.maps.LatLngBounds(
                        new google.maps.LatLng($lat_min, $lng_min), // bottom left
                        new google.maps.LatLng($lat_max, $lng_max) //top right
                    ));
                    var Path = new google.maps.Polyline({
                        path: $Coordinates,
                        geodesic: $polyline_geodesic,
                        strokeColor: $polyline_stroke_color,
                        strokeOpacity: $polyline_stroke_opacity,
                        strokeWeight: $polyline_stroke_weight
                    });

                    Path.setMap(map);
                }
            }

            // Center map if needed
            if( ($address!='') && ($center_based_on_address==true) ) {
                var geocoder = new google.maps.Geocoder();
                // Replace with tag if needed
                var $regular_expression = /\{(.*?)\}/g;
                $address = SUPER.update_variable_fields.replace_tags($form, $regular_expression, $address);
                
                // Check if address is not empty
                if($address!=''){
                    geocoder.geocode( { 'address': $address}, function(results, status) {
                        if (status == 'OK') {
                            // Center map based on given address
                            map.setCenter(results[0].geometry.location);
                            // Add marker on address location
                            if( $address_marker=='true' ) {
                                var marker = new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location
                                });
                            }
                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                    });
                }
            }

        });
    }

    SUPER.google_maps_api.initAutocomplete = function($changed_field, $form){
        $form.find('.super-address-autopopulate:not(.super-autopopulate-init)').each(function(){
            var $element = $(this);
            var $field = $element.find('.super-shortcode-field');
            $element.addClass('super-autopopulate-init');
            var $form = $element.parents('.super-form:eq(0)');
            var autocomplete = new google.maps.places.Autocomplete( $element[0], {types: ['geocode']} );
            autocomplete.addListener( 'place_changed', function () {
                var mapping = {
                    street_number: 'street_number',
                    route: 'street_name',
                    locality: 'city',
                    administrative_area_level_2: 'municipality',
                    administrative_area_level_1: 'state',
                    country: 'country',
                    postal_code: 'postal_code'
                };
                var place = autocomplete.getPlace();
                $field.val(place.formatted_address);

                // @since 3.2.0 - add address latitude and longitude for ACF google map compatibility
                var lat = autocomplete.getPlace().geometry.location.lat();
                var lng = autocomplete.getPlace().geometry.location.lng();
                $element.attr('data-lat', lat).attr('data-lng', lng);
                
                // @since 3.5.0 - trigger / update google maps in case {tags} have been used
                SUPER.google_maps_init($element, $form);

                $element.trigger('keyup');
                var $street_name = '';
                var $street_number = '';
                for (var i = 0; i < place.address_components.length; i++) {
                    var addressType = place.address_components[i].types[0];
                    var attribute = $element.data('map-'+mapping[addressType]);
                    if(typeof attribute !=='undefined'){
                        var attribute = attribute.split('|');
                        if(attribute[1]=='') attribute[1] = 'long';
                        var val = place.address_components[i][attribute[1]+'_name'];
                        if(attribute[0]=='street_name') $street_name = val;
                        if(attribute[0]=='street_number') $street_number = val;
                        var $input = $form.find('.super-shortcode-field[name="'+attribute[0]+'"]');
                        $input.val(val);
                        SUPER.after_dropdown_change_hook($input); // @since 3.1.0 - trigger hooks after changing the value
                    }
                }

                // @since 3.5.0 - combine street name and number
                var attribute = $element.data('map-street_name_number');
                if( typeof attribute !=='undefined' ) {
                    var $address = '';
                    if( $street_name!='' ) $address += $street_name;
                    if( $address!='' ) {
                        $address += ' '+$street_number;
                    }else{
                        $address += $street_number;
                    } 
                    var attribute = attribute.split('|');
                    var $input = $form.find('.super-shortcode-field[name="'+attribute[0]+'"]');
                    $input.val($address);
                    SUPER.after_dropdown_change_hook($input); // @since 3.1.0 - trigger hooks after changing the value
                }

                // @since 3.5.1 - combine street number and name
                var attribute = $element.data('map-street_number_name');
                if( typeof attribute !=='undefined' ) {
                    var $address = '';
                    if( $street_number!='' ) $address += $street_number;
                    if( $address!='' ) {
                        $address += ' '+$street_name;
                    }else{
                        $address += $street_name;
                    } 
                    var attribute = attribute.split('|');
                    var $input = $form.find('.super-shortcode-field[name="'+attribute[0]+'"]');
                    $input.val($address);
                    SUPER.after_dropdown_change_hook($input); // @since 3.1.0 - trigger hooks after changing the value
                }


            });
        });
    }

    // Checkbox handler
    SUPER.checkboxes = function(){
        $('.super-checkbox').each(function(){
            var $value = '';
            var $counter = 0;
            var $checked = $(this).find('input[type="checkbox"]:checked');
            $checked.each(function () {
                if ($counter == 0) $value = $(this).val();
                if ($counter != 0) $value = $value + ',' + $(this).val();
                $counter++;
            });
            $(this).find('input[type="hidden"]').val($value);
        });
        $('.super-radio, .super-shipping').each(function(){
            var $name = $(this).find('.super-shortcode-field').attr('name');
            $(this).find('input[type="radio"]').attr('name','group_'+$name);
        });
        $('.super-shipping').each(function(){
            if(!$(this).hasClass('html-finished')){
                var $currency = $(this).find('.super-shortcode-field').attr('data-currency');
                $(this).find('input[type="radio"]').each(function(){
                    var $html = $(this).parent().html();
                    var $value = $(this).val();
                    $(this).parent().html($html+'<span class="super-shipping-price"> &#8212; '+$currency+''+parseFloat($value).toFixed(2)+'</span>');
                });
                $(this).addClass('html-finished');
            }        
        });
    }

    // @since 3.2.0 - Reverse columns
    SUPER.reverse_columns = function($form){
        $form.find('.super-grid').each(function(){
            var $grid = $(this);
            var $columns = $grid.children('div.super-column:not(.super-not-responsive)');
            $grid.append($columns.get().reverse());
            $grid.children('div.super-column:last-child').removeClass('first-column');
            $grid.children('div.super-column:eq(0)').addClass('first-column');
        });
    }

    // Handle columns
    SUPER.handle_columns = function(){
        
        var $preload = super_common_i18n.preload;
        $('div.super-field').each(function(){
            if($(this).hasClass('grouped')){
                if((!$(this).prev().hasClass('grouped')) || ($(this).prev().hasClass('grouped-end'))){
                    $(this).addClass('grouped-start'); 
                }
            }
        });
        var $width = 0;
        $('.super-field > .super-label').each(function () {
            if($(this).parent().index()); 
            if (!$(this).parent().hasClass('grouped')) {
                if ($(this).outerWidth(true) > $width) $width = $(this).outerWidth(true);
            }
        });
        
        //Checkbox fields
        SUPER.checkboxes();
        
        //Barcodes
        SUPER.generateBarcode();
        
        //Rating
        SUPER.rating();

        $('.super-form').each(function () {
            var $this = $(this);

            // @since 3.2.0 
            // - Add tab indexes to all fields
            // - Check if RTL support is enabled, if so we must reverse columns order before we add TAB indexes to fields
            if( $this.hasClass('super-rtl') ) {
                // Reverse column order before adding TAB indexes
                SUPER.reverse_columns($this);
            }
            // - After we reverted the column order, loop through all the fields and add the correct TAB indexes
            var $exclusion = super_common_i18n.tab_index_exclusion;
            $fields = $($this.find('.super-field:not('+$exclusion+')').get());
            $fields.each(function(key, value){
                $(value).attr('data-super-tab-index', key);
            });
            // - Now we have added the TAB indexes, make sure to reverse the order back to normal in case of RTL support
            if( $this.hasClass('super-rtl') ) {
                SUPER.reverse_columns($this);
            }
            
            SUPER.after_initializing_forms_hook(undefined, $this, function($this){
                $this.addClass('super-rendered');
                if (!$this.hasClass('preload-disabled')) {
                    if (!$this.hasClass('super-initialized')) {
                        setTimeout(function (){
                            $this.fadeOut(100, function () {
                                $this.addClass('super-initialized').fadeIn(500);
                            });
                        }, 500);
                    }
                } else {
                    $this.addClass('super-initialized');
                }
            });
        });

    }

    // Remove responsive class from the form
    SUPER.remove_super_form_classes = function($this, $classes){
        $.each($classes, function( k, v ) {
            $this.removeClass(v);
        });
    }

    // Replace HTML element {tags} with field values
    // @since 1.2.7
    SUPER.init_replace_html_tags = function($changed_field, $form){
        var $v,
            $regex,
            $form,
            $html_fields,
            $target,
            $html,
            $str,
            $original,
            $field_name,
            $field,
            $return,
            $rows,
            $row,
            $found,
            $tag_items,
            $old_name,
            $new_name,
            $regular_expression,
            $array,
            $value,
            $counter,
            $values,
            $new_value;
        if(typeof $form === 'undefined'){
            $form = SUPER.get_frontend_or_backend_form();           
        }
        if(typeof $changed_field === 'undefined') {
            $html_fields = $form.find('.super-html-content');
        }else{
            $form = $changed_field.parents('.super-form:eq(0)');
            $html_fields = $form.find('.super-html-content[data-fields*="['+$changed_field.attr('name')+']"]');
        }
        $html_fields.each(function(){
            $target = $(this);
            $html = $target.parent().children('textarea').val();
            if( $html!='' ) {
                // @since 4.6.0 - foreach loop compatibility
                $regex = /foreach\s?\(\s?[\'|"|\s|]?(.*?)[\'|"|\s|]?\)\s?:([\s\S]*?)(?:endforeach\s?;)/g;
                $str = $html;
                while (($v = $regex.exec($str)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if ($v.index === $regex.lastIndex) {
                        $regex.lastIndex++;
                    }
                    $original = $v[0];
                    $field_name = $v[1];
                    $return = '';
                    if(typeof $v[2] !== 'undefined') $return = $v[2];
                    $rows = '';
                    $field = $form.find('.super-shortcode-field[name="'+$field_name+'"]');
                    if($field.length){
                        // Of course we have at least one row, so always return the first row
                        $row = $return.split('<%counter%>').join(1);
                        $row = $row.split('<%').join('{');
                        $row = $row.split('%>').join('}');
                        $rows += $row;
                        // Loop through all the fields that have been dynamically added by the user
                        $i=2;
                        $found = $form.find('.super-shortcode-field[name="'+$field_name + '_' + ($i)+'"]').length;
                        while($found!==0){
                            $found = $form.find('.super-shortcode-field[name="'+$field_name + '_' + ($i)+'"]').length;
                            if($found){
                                $row = $return.split('<%counter%>').join($i);
                                $regex = /<%(.*?)%>/g;
                                $str = $return;
                                while (($v = $regex.exec($str)) !== null) {
                                    // This is necessary to avoid infinite loops with zero-width matches
                                    if ($v.index === $regex.lastIndex) {
                                        $regex.lastIndex++;
                                    }
                                    $tag_items = $v[1].split(';');
                                    $old_name = $tag_items[0];
                                    if($old_name!=='counter'){
                                        $tag_items[0] = $tag_items[0]+'_'+$i;
                                        $new_name = $tag_items.join(';');
                                        $row = $row.split('<%'+$v[1]+'%>').join('{'+$new_name+'}');
                                    }
                                }
                                $rows += $row;
                            }
                            $i++;
                        }
                    }
                    $html = $html.split($original).join($rows);
                    
                }

                $regular_expression = /\{(.*?)\}/g;
                $array = [];
                $value = '';
                $counter = 0;
                while (($match = $regular_expression.exec($html)) != null) {
                    $array[$counter] = $match[1];
                    $counter++;
                }
                if( $array.length>0 ) {
                    for (var $counter = 0; $counter < $array.length; $counter++) {
                        $values = $array[$counter];
                        $new_value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, '{'+$values+'}', $target);
                        $html = $html.replace('{'+$values+'}', $new_value);
                    }
                }

                // @since 4.6.0 - if statement compatibility
                $regex = /if\s?\(\s?[\'|"|\s|]?(.*?)[\'|"|\s|]?(==|!=|>=|<=|>|<)\s?[\'|"|\s|]?(.*?)[\'|"|\s|]?\)\s?:([\s\S]*?)(?:endif\s?;|(?:elseif\s?:([\s\S]*?))endif\s?;)/g;
                $str = $html;
                while (($v = $regex.exec($str)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if ($v.index === $regex.lastIndex) {
                        $regex.lastIndex++;
                    }
                    $original = $v[0];
                    $value1 = $v[1];
                    $operator = $v[2];
                    $value2 = $v[3];
                    $true = '';
                    $false = '';
                    if(typeof $v[4] !== 'undefined') $true = $v[4];
                    if(typeof $v[5] !== 'undefined') $false = $v[5];
                    if( $operator=='==' ) {
                        if( $value1==$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    if( $operator=='!=' ) {
                        if( $value1!=$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    if( $operator=='>=' ) {
                        if( $value1>=$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    if( $operator=='<=' ) {
                        if( $value1<=$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    if( $operator=='>' ) {
                        if( $value1>$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    if( $operator=='<' ) {
                        if( $value1<$value2 ) {
                            $statement = $true;
                        }else{
                            $statement = $false;
                        }
                    }
                    $html = $html.replace($original, $statement);
                }

                $target.html($html);
            }
        });
    }

    // Replace form action attribute {tags} with field values
    // @since 4.4.6
    SUPER.init_replace_post_url_tags = function($changed_field, $form){
        if(typeof $form === 'undefined'){
            var $form = SUPER.get_frontend_or_backend_form();           
        }
        if(typeof $changed_field !== 'undefined') {
            var $form = $changed_field.parents('.super-form:eq(0)');
        }
        var $action = $form.children('form').attr('action');
        var $actiontags = $form.children('form').attr('data-actiontags');
        // Only if action is defined
        if(typeof $action !== 'undefined'){
            var $target = $form.children('form');
            var $regular_expression = /\{(.*?)\}/g;
            var $array = [];
            var $value = '';
            var $counter = 0;
            while (($match = $regular_expression.exec($actiontags)) != null) {
                $array[$counter] = $match[1];
                $counter++;
            }
            if( $array.length>0 ) {
                for (var $counter = 0; $counter < $array.length; $counter++) {
                    var $values = $array[$counter];
                    var $new_value = SUPER.update_variable_fields.replace_tags($form, $regular_expression, '{'+$values+'}', $target);
                    $actiontags = $actiontags.replace('{'+$values+'}', $new_value);
                }
            }
            $target.attr('action', $actiontags);
        }
    }

    // Init text editors
    SUPER.init_text_editors = function(){
        if( typeof tinyMCE !== 'undefined' ) {
            $('.super-text-editor:not(.super-initialized)').each(function(){
                var $this = $(this);
                var $form = $this.parents('.super-form:eq(0)');
                var $name = $this.attr('id');
                var $incl_url = $this.data('incl-url');
                tinyMCE.execCommand('mceRemoveEditor', true, $name);
                tinyMCEPreInit = {
                    baseURL: $this.data('baseurl'),
                    suffix: '.min',
                    mceInit: {},
                    qtInit: {},
                    ref: {},
                    load_ext: function(url,lang){
                        var sl=tinyMCE.ScriptLoader;
                        sl.markDone(url+'/langs/'+lang+'.js');
                        sl.markDone(url+'/langs/'+lang+'_dlg.js');
                    }
                };

                tinyMCEPreInit.mceInit[$name] = {
                    theme:"modern",
                    skin:"lightgray",
                    language:"en",
                    formats:{
                        alignleft: [{
                            selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", 
                            styles: {
                                textAlign:"left"
                            }
                        },{
                            selector: "img,table,dl.wp-caption", 
                            classes: "alignleft"
                        }],
                        aligncenter: [{
                            selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", 
                            styles: {
                                textAlign:"center"
                            }
                        },{
                            selector: "img,table,dl.wp-caption", 
                            classes: "aligncenter"
                        }],
                        alignright: [{
                            selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", 
                            styles: {
                                textAlign:"right"
                            }
                        },{
                            selector: "img,table,dl.wp-caption", 
                            classes: "alignright"
                        }],strikethrough: {
                            inline: "del"
                        }
                    },
                    relative_urls:false,
                    remove_script_host:false,
                    convert_urls:false,
                    browser_spellcheck:true,
                    fix_list_elements:true,
                    entities:"38,amp,60,lt,62,gt",
                    entity_encoding:"raw",
                    keep_styles:false,
                    cache_suffix:"wp-mce-4310-20160418",
                    preview_styles:"font-family font-size font-weight font-style text-decoration text-transform",
                    end_container_on_empty_block:true,
                    wpeditimage_disable_captions:false,
                    wpeditimage_html5_captions:true,
                    // @since 4.0.0 - delete 'wpembed' from plugin list  because Wordpress 4.8 and latest tinymce dropped wpembed 
                    plugins:"charmap,colorpicker,hr,lists,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpautoresize,wpeditimage,wpemoji,wpgallery,wplink,wpdialogs,wptextpattern,wpview",
                    wp_lang_attr:"en-US",
                    content_css:$incl_url+"/css/dashicons.css,"+$incl_url+"/js/tinymce/skins/wordpress/wp-content.css",
                    selector:"#"+$name,
                    resize:"vertical",
                    menubar:false,
                    wpautop:false,
                    indent:false,
                    toolbar1:"bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
                    toolbar2:"formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
                    toolbar3:"",
                    toolbar4:"",
                    tabfocus_elements:":prev,:next",
                    body_class:$name+" post-type-page post-status-publish locale-en-us"
                };

                tinyMCEPreInit.qtInit[$name] = {
                    id:$name,
                    buttons:"strong,em,link,block,del,ins,img,ul,ol,li,code,more,close"
                };

                tinyMCEPreInit.ref = {
                    // @since 4.0.0 - delete 'wpembed' from plugin list  because Wordpress 4.8 and latest tinymce dropped wpembed 
                    plugins:"charmap,colorpicker,hr,lists,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpautoresize,wpeditimage,wpemoji,wpgallery,wplink,wpdialogs,wptextpattern,wpview",
                    theme:"modern",
                    language:"en"
                };

                if( ($this.data('teeny')=='true') || ($this.data('teeny')==true) ){
                    tinyMCEPreInit.mceInit[$name].toolbar2 = false;
                }
                if( ($this.data('force-br')=='true') || ($this.data('force-br')==true) ){
                    tinyMCEPreInit.mceInit[$name].forced_root_block = false;
                    tinyMCEPreInit.mceInit[$name].force_br_newlines = true;
                    tinyMCEPreInit.mceInit[$name].force_p_newlines = false;
                    tinyMCEPreInit.mceInit[$name].convert_newlines_to_brs = true;
                }

                var init, id, $wrap;
                for ( id in tinyMCEPreInit.mceInit ) {
                    init = tinyMCEPreInit.mceInit[id];
                    $wrap = tinyMCE.$( '#wp-' + id + '-wrap' );

                    if ( ( $wrap.hasClass( 'tmce-active' ) || ! tinyMCEPreInit.qtInit.hasOwnProperty( id ) ) && ! init.wp_skip_init ) {
                        tinyMCE.init( init );

                        if ( ! window.wpActiveEditor ) {
                            window.wpActiveEditor = id;
                        }
                    }
                }
                for ( id in tinyMCEPreInit.qtInit ) {
                    quicktags( tinyMCEPreInit.qtInit[id] );

                    if ( ! window.wpActiveEditor ) {
                        window.wpActiveEditor = id;
                    }
                }
            });
        }
    }

    // @since 2.0.0 - set dropdown placeholder function
    SUPER.init_set_dropdown_placeholder = function($form){

        if(typeof $form === 'undefined') var $form = $('.super-form');

        $form.find('.super-dropdown-ui').each(function(){
            var $this = $(this);
            var $field = $this.parent('.super-field-wrapper').find('.super-shortcode-field');
            var $first_item = $this.children('li:eq(1)');

            // @since 3.1.0 - first check if the field is not empty by GET or POST
            var $value = $field.val();
            if($value==''){
                // @since   1.1.8    - check if we can find a default value
                var $value = $field.data('default-value');
            }

            if( (typeof $value !== 'undefined') &&  ($value!='') ) {
                $field.val($value);
                var $new_placeholder = '';
                var $value = $value.toString().split(',');
                $.each($value, function( index, value ) {
                    value = $.trim(value);
                    // Lets find the option name based on the matched value
                    $this.children('li:not(.super-placeholder)').each(function(){
                        var $item_first_value = $(this).attr('data-value').split(';')[0];
                        if($item_first_value==value){
                            $(this).addClass('super-active');
                            if($new_placeholder==''){
                                $new_placeholder += $(this).html();
                            }else{
                                $new_placeholder += ','+$(this).html();
                            }
                        }
                    });
                });
                $this.children('.super-placeholder').html($new_placeholder);
            }else{
                $field.val('');
                var $placeholder = $field.attr('placeholder');
                if( (typeof $placeholder !== 'undefined') &&  ($placeholder!='') ) {
                    $this.children('.super-placeholder').attr('data-value', '').html($placeholder);
                }else{
                    if($this.children('.super-placeholder').html()==''){
                        $first_item.addClass('super-active');
                        $this.children('.super-placeholder').attr('data-value', $first_item.attr('data-value')).html($first_item.html());
                    }
                }
            }
        });
    }

    // @since 3.1.0 - print form data
    SUPER.init_print_form = function($form, $submit_button){
        var win = window.open('','printwindow');
        var $html = '';
        var $print_file = $submit_button.find('input[name="print_file"]');
        if( (typeof $print_file.val() !== 'undefined') && ($print_file.val()!='') && ($print_file.val()!='0') ) {
            // @since 3.9.0 - print custom HTML
            var $file_id = $print_file.val();
            $data = SUPER.prepare_form_data($form);
            var $form_id = $data.form_id;
            $data = SUPER.after_form_data_collected_hook($data.data);
            $.ajax({
                url: super_common_i18n.ajaxurl,
                type: 'post',
                data: {
                    action: 'super_print_custom_html',
                    data: $data,
                    file_id: $file_id
                },
                success: function (result) {
                    win.document.write(result);
                    win.print();
                    win.close();
                    return false;          
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr, ajaxOptions, thrownError);
                    alert('Failed to process data, please try again');
                    return false;
                }
            });
        }else{
            $css = "<style type=\"text/css\">";
            $css += "body {font-family:Arial,sans-serif;color:#444;-webkit-print-color-adjust:exact;}";
            $css += "table {font-size:12px;}";
            $css += "table th{text-align:right;font-weight:bold;font-size:12px;padding-right:5px;}";
            $css += "table td{font-size:12px;}";
            $css += "</style>";
            var $html = $css;
            $html += '<table>';
            $form.find('.super-shortcode-field').each(function(){           
                if( ($(this).attr('name')=='hidden_form_id') || ($(this).attr('name')=='id') ) return true;
                var $parent = $(this).parents('.super-shortcode:eq(0)');
                $html += '<tr>';
                $html += '<th>';
                $html += $(this).data('email');
                $html += '</th>';
                $html += '<td>';
                    if($parent.hasClass('super-radio')){
                        $html += $parent.find('.super-active').text();
                    }else if($parent.hasClass('super-dropdown')){
                        var $items = '';
                        $parent.find('.super-dropdown-ui .super-active').each(function(){
                            if($items==''){
                                $items += $(this).text();
                            }else{
                                $items += ', '+$(this).text();
                            }
                        });
                        $html += $items;
                    }else if($parent.hasClass('super-checkbox')){
                        var $items = '';
                        $parent.find('.super-active').each(function(){
                            if($items==''){
                                $items += $(this).text();
                            }else{
                                $items += ', '+$(this).text();
                            }
                        });
                        $html += $items;
                    }else{
                        $html += $(this).val();
                    }
                $html += '</td>';
                $html += '</tr>';
            });
            $html += '</table>';
            win.document.write($html);
            win.print();
            win.close();
        }
    };

    // @since 2.0.0 - clear / reset form fields
    SUPER.init_clear_form = function($form){

        // Remove all dynamic added columns
        $form.find('.super-duplicate-column-fields').each(function(){
            if($(this).index()>0){
                $(this).remove();
            }    
        });

        // Clear all fields
        $form.find('.super-shortcode-field').each(function(){
            if($(this).attr('name')=='hidden_form_id') return true;

            var $element = $(this);

            // check if this value has a default value
            var $value = '';
            var $field = $element.parents('.super-field:eq(0)');
            var $default_value = $element.data('default-value');
            
            // Checkbox and Radio buttons
            if( $field.hasClass('super-checkbox') || $field.hasClass('super-radio') ){
                $field.find('.super-field-wrapper > label').removeClass('super-active');
                $field.find('.super-field-wrapper > label input').prop('checked', false);
                $field.find('.super-field-wrapper > label.super-default-selected').addClass('super-active');  
                $field.find('.super-field-wrapper > label.super-default-selected input').prop('checked', true);
            }
            // Toggle field
            if($field.hasClass('super-toggle')){
                var $switch = $field.find('.super-toggle-switch');
                if($default_value==0){
                    $switch.removeClass('super-active');
                    var $toggle_value = $switch.find('.super-toggle-off').data('value');
                }else{
                    $switch.addClass('super-active');
                    var $toggle_value = $switch.find('.super-toggle-on').data('value');
                }
                $element.val($toggle_value);
                return true;
            }

            // Dropdown field
            if($field.hasClass('super-dropdown')){
                $field.find('.super-dropdown-ui > li').removeClass('super-active');
                $field.find('.super-dropdown-ui > li.super-default-selected').addClass('super-active');
                if( (typeof $default_value !== 'undefined') && ($default_value!='') ) {
                    var $option = $field.find('.super-dropdown-ui > li[data-value="'+$default_value+'"]');
                    $field.find('.super-placeholder').html($option.text());
                    $option.addClass('super-active');
                    $element.val($default_value);
                }else{
                    if($field.find('.super-dropdown-ui > li.super-active').length==0){
                        if( (typeof $element.attr('placeholder') !== 'undefined') && ($element.attr('placeholder')!='') ) {
                            $field.find('.super-placeholder').html($element.attr('placeholder'));
                            $field.find('.super-dropdown-ui > li[data-value="'+$element.data('placeholder')+'"]').addClass('super-active');
                        }else{
                            $field.find('.super-placeholder').html($field.find('.super-dropdown-ui > li:eq(0)').text());
                        }
                        $element.val('');
                    }else{
                        var $new_value = '';
                        var $new_placeholder = '';
                        $field.find('.super-dropdown-ui > li.super-active').each(function(){
                            if($new_value==''){
                                $new_value += $(this).data('value');
                            }else{
                                $new_value += ','+$(this).data('value');
                            }
                            if($new_placeholder==''){
                                $new_placeholder += $(this).text();
                            }else{
                                $new_placeholder += ', '+$(this).text();
                            }
                        });
                        $field.find('.super-placeholder').html($new_placeholder);
                        $element.val($new_value);
                    }
                }
                return true;
            }
            if(typeof $default_value !== 'undefined'){
                $value = $default_value;
                $element.val($value);
                // Slider field
                if($field.hasClass('super-slider')){
                    // Only have to set new value if slider was already initialized (this depends on clearing form after a dynamic column was added)
                    if($element.parent('.super-field-wrapper').children('.slider').length){
                        $element.simpleSlider("setValue", $value);
                    }
                    return true;
                }
                // Rating field
                if($field.hasClass('super-rating')){
                    if($value==0){
                        $field.find('.super-rating-star').removeClass('super-active');
                    }else{
                        var $rating = $field.find('.super-rating-star:eq('+($value-1)+')');
                        if($rating.length){
                            $field.find('.super-rating-star').removeClass('super-active');
                            $rating.addClass('super-active');
                            $rating.prevAll('.super-rating-star').addClass('super-active');
                        }
                    }
                }
            }else{
                // Countries field
                if($field.hasClass('super-countries')){
                    var $placeholder = $element.attr('placeholder');
                    if(typeof $placeholder === 'undefined' ) {
                        var $dropdown = $field.find('.super-dropdown-ui');
                        var $option = $field.find('.super-dropdown-ui > li:nth-child(2)');
                        $dropdown.children('li').removeClass('super-active');
                        $dropdown.children('.super-default-selected').addClass('super-active');
                        $dropdown.find('.super-placeholder').attr('data-value',$option.data('value')).html($option.html());
                        $element.val($option.data('value'));
                    }else{
                        var $dropdown = $field.find('.super-dropdown-ui');
                        $dropdown.children('li').removeClass('super-active');
                        $dropdown.find('.super-placeholder').attr('data-value','').html($placeholder);
                        $element.val('');
                    }
                    return true;
                }
                // File upload field
                if($field.hasClass('super-file')){
                    $field.find('.super-fileupload-files').html('');
                    $field.find('.super-progress-bar').attr('style','');
                    var $element = $field.find('.super-active-files');
                    $element.val('');
                    return true;
                }
            }
            $element.val($value);
        });

        // @since 2.9.0 - make sure to do conditional logic and calculations
        SUPER.after_field_change_blur_hook();

        // After form cleared
        SUPER.after_form_cleared_hook($form);

    }


    // Populate form with entry data found after ajax call
    SUPER.populate_form_with_entry_data = function(result, $this, $form){
        var $data = jQuery.parseJSON(result);
        if($data!=false){
            // First clear the form
            SUPER.init_clear_form($form);
            // Find all dynamic columns and get the first field name
            var $dynamic_fields = {};
            $form.find('.super-duplicate-column-fields').each(function(){
                var $first_field = $(this).find('.super-shortcode-field:eq(0)');
                var $first_field_name = $first_field.attr('name');
                $dynamic_fields[$first_field_name] = $first_field;
            });
            $.each($dynamic_fields, function(index, field){
                var $i = 2;
                while(typeof $data[index+'_'+$i] !== 'undefined'){
                    if($form.find('.super-shortcode-field[name="'+index+'_'+$i+'"]').length==0) {
                        field.parents('.super-duplicate-column-fields:eq(0)').find('.super-add-duplicate').click();
                    }
                    $i++;
                }
            });
            $.each($data, function(index, v){
                if(v.name==$this.attr('name')){
                    return true;
                }
                var $element = $form.find('.super-shortcode-field[name="'+v.name+'"]');
                var $field = $element.parents('.super-field:eq(0)');
                // File upload field
                if(v.type=='files'){
                    if((typeof v.files !== 'undefined') && (v.files.length!=0)){
                        var $html = '';
                        var $files = '';
                        $.each(v.files, function( fi, fv ) {
                            if(fi==0) {
                                $files += fv.value;
                            }else{
                                $files += ','+fv.value;
                            }
                            $element = $form.find('.super-active-files[name="'+fv.name+'"]');
                            $field = $element.parents('.super-field:eq(0)');     
                            $html += '<div data-name="'+fv.value+'" class="super-uploaded"';
                            $html += ' data-url="'+fv.url+'"';
                            $html += ' data-thumburl="'+fv.thumburl+'">';
                            $html += '<span class="super-fileupload-name"><a href="'+fv.url+'" target="_blank">'+fv.value+'</a></span>';
                            $html += '<span class="super-fileupload-delete">[x]</span>';
                            $html += '</div>';
                        });
                        $element.val($files);
                        $field.find('.super-fileupload-files').html($html);
                        $field.find('.super-fileupload').addClass('finished');
                    }else{
                        $field.find('.super-fileupload-files').html('');
                        $field.find('.super-progress-bar').attr('style','');
                        var $element = $field.find('.super-active-files');
                        $element.val('');
                    }
                    return true;
                }
                var $value = v.value;
                if($element.val()!=$value) $element.val($value);
                // Slider field
                if($field.hasClass('super-slider')){
                    $element.simpleSlider("setValue", $value);
                    return true;
                }
                // Autosuggest field
                if($field.hasClass('super-auto-suggest')){
                    if($value!=''){
                        var $first_value = $value.split(';')[0];
                        var $dropdown = $field.find('.super-dropdown-ui');
                        var $set_field_value = '';
                        $dropdown.children('li').removeClass('super-active');
                        $dropdown.children('li').each(function(){
                            var $item_first_value = $(this).attr('data-value').split(';')[0];
                            if($item_first_value==$first_value){
                                $(this).addClass('super-active');
                                if($set_field_value==''){
                                    $set_field_value += $(this).text();
                                }else{
                                    $set_field_value += ','+$(this).text();
                                }
                            }
                        });
                        $element.val($set_field_value);
                    }else{
                        $field.find('.super-dropdown-ui > li').removeClass('super-active');
                    }
                }
                // Dropdown field
                if($field.hasClass('super-dropdown')){
                    if($value!=''){
                        var $options = $value.split(',');
                        var $dropdown = $field.find('.super-dropdown-ui');
                        $dropdown.children('li').removeClass('super-active');
                        var $set_field_value = '';
                        $.each($options, function( index, v ) {
                            $dropdown.children('li:not(.super-placeholder)').each(function(){
                                var $item_first_value = $(this).attr('data-value').split(';')[0];
                                if($item_first_value==v){
                                    $(this).addClass('super-active');
                                    if($set_field_value==''){
                                        $set_field_value += $item_first_value;
                                    }else{
                                        $set_field_value += ','+$item_first_value;
                                    }
                                }
                            });
                        });
                        $element.val($set_field_value);
                    }else{
                        $field.find('.super-dropdown-ui > li').removeClass('super-active');
                        $field.find('.super-dropdown-ui > li.super-default-selected').addClass('super-active');
                        
                    }
                    SUPER.init_set_dropdown_placeholder();
                    return true;
                }
                // Radio buttons
                if($field.hasClass('super-radio')){
                    var $wrapper = $field.find('.super-field-wrapper');
                    var $labels = $wrapper.children('label');
                    var $input = $labels.children('input');
                    $labels.removeClass('super-active');
                    $input.prop('checked', false);
                    if($value!=''){
                        $labels.children('input[value="'+$value+'"]').prop('checked', false);
                        $labels.children('input[value="'+$value+'"]').parents('label:eq(0)').addClass('super-active');
                    }else{
                        $wrapper.find('label.super-default-selected').addClass('super-active');  
                        $wrapper.find('label.super-default-selected input').prop('checked', true);
                    }
                    return true;
                }
                // Checkboxes
                if($field.hasClass('super-checkbox')){
                    var $wrapper = $field.find('.super-field-wrapper');
                    var $labels = $wrapper.children('label');
                    var $input = $labels.children('input');
                    $labels.removeClass('super-active');
                    $input.prop('checked', false);
                    if($value!=''){
                        var $options = $value.split(',');
                        $.each($options, function( index, v ) {
                            $labels.children('input[value="'+v+'"]').prop('checked', false);
                            $labels.children('input[value="'+v+'"]').parents('label:eq(0)').addClass('super-active');
                        });
                    }else{
                        $wrapper.children('label.super-default-selected').addClass('super-active');  
                        $wrapper.children('label.super-default-selected input').prop('checked', true);
                    }
                    return true;
                }
                // Rating field
                if($field.hasClass('super-rating')){
                    var $rating = $field.find('.super-rating-star:eq('+($value-1)+')');
                    if($rating.length){
                        $field.find('.super-rating-star').removeClass('super-active');
                        $rating.addClass('super-active');
                        $rating.prevAll('.super-rating-star').addClass('super-active');
                    }
                    return true;
                }
                // Countries field
                if($field.hasClass('super-countries')){
                    if($value!=''){
                        var $options = $value.split(',');
                        var $dropdown = $field.find('.super-dropdown-ui');
                        $dropdown.children('li').removeClass('super-active');
                        $.each($options, function( index, v ) {
                            $dropdown.children('li[data-value="'+v+'"]').addClass('super-active');
                        });
                    }else{
                        var $placeholder = $element.attr('placeholder');
                        if(typeof $placeholder === 'undefined' ) {
                            var $dropdown = $field.find('.super-dropdown-ui');
                            var $option = $field.find('.super-dropdown-ui > li:nth-child(2)');
                            $dropdown.children('li').removeClass('super-active');
                            $dropdown.children('.super-default-selected').addClass('super-active');
                            $dropdown.find('.super-placeholder').attr('data-value',$option.data('value')).html($option.html());
                            $element.val($option.data('value'));
                        }else{
                            var $dropdown = $field.find('.super-dropdown-ui');
                            $dropdown.children('li').removeClass('super-active');
                            $dropdown.find('.super-placeholder').attr('data-value','').html($placeholder);
                            $element.val('');
                        }
                    }
                    return true;
                }
            });
            // @since 2.4.0 - after inserting all the fields, update the conditional logic and variable fields
            SUPER.after_field_change_blur_hook();
        }
    };

    // Retrieve entry data through ajax
    // (this function is called when search field is changed, or when $_GET is set on page load)
    SUPER.populate_form_data_ajax = function($this){
        var $value,
            $skip,
            $method,
            $form = $this.parents('.super-form:eq(0)');
        // If we are populating based of WC order search
        if($this.hasClass('super-wc-order-search')){
            // Get order ID based of active item
            $value = $this.find('.super-active').data('value');
            $order_id = $value.split(';')[0];
            // Check if we need to skip any fields
            $skip = $this.data('wcoss');
            if(typeof $skip === 'undefined' ) $skip = '';
            // We now have the order ID, let's search the order and get entry data if possible
            $this.parents('.super-field-wrapper:eq(0)').addClass('super-populating');
            $form.addClass('super-populating');
            $.ajax({
                url: super_common_i18n.ajaxurl,
                type: 'post',
                data: {
                    action: 'super_populate_form_data',
                    order_id: $order_id,
                    skip: $skip
                },
                success: function (result) {
                    SUPER.populate_form_with_entry_data(result, $this, $form);
                },
                complete: function(){
                    $this.parents('.super-field-wrapper:eq(0)').removeClass('super-populating');
                    $form.removeClass('super-populating');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr, ajaxOptions, thrownError);
                    alert('Failed to process data, please try again');
                }
            });
        }else{
            $this.attr('data-typing', 'false');
            $value = $this.val();
            $method = $this.data('search-method');
            $skip = $this.data('search-skip');
            if(typeof $skip === 'undefined' ) $skip = '';
            if( $value.length>2 ) {
                $this.parents('.super-field-wrapper:eq(0)').addClass('super-populating');
                $form.addClass('super-populating');
                $.ajax({
                    url: super_common_i18n.ajaxurl,
                    type: 'post',
                    data: {
                        action: 'super_populate_form_data',
                        value: $value,
                        method: $method,
                        skip: $skip
                    },
                    success: function (result) {
                        SUPER.populate_form_with_entry_data(result, $this, $form);
                    },
                    complete: function(){
                        $this.parents('.super-field-wrapper:eq(0)').removeClass('super-populating');
                        $form.removeClass('super-populating');
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr, ajaxOptions, thrownError);
                        alert('Failed to process data, please try again');
                    }
                });
            }
        }
    }

    // init the form on the frontend
    SUPER.init_super_form_frontend = function(){
        // @since 3.3.0 - make sure to load dynamic columns correctly based on found contact entry data when a search field is being used
        $('.super-shortcode-field[data-search="true"]:not(.super-dom-populated)').each(function(){
            if($(this).val()!=''){
                $(this).addClass('super-dom-populated');
                SUPER.populate_form_data_ajax($(this));
            }
        });

        SUPER.init_text_editors();

        // @since 2.3.0 - init file upload fields
        SUPER.init_fileupload_fields();

        //Set dropdown placeholder
        SUPER.init_set_dropdown_placeholder($('.super-form:not(.super-rendered)'));

        // @since 1.1.8     - set radio button to correct value
        $('.super-field.super-radio').each(function(){
            var $this = $(this);
            var $value = $this.find('.super-shortcode-field').val();
            if( typeof $value !== 'undefined' ) {
                var $value = $value.split(',');
                $this.find('input[type="radio"]').prop("checked", false);
                $.each($value, function( index, value ) {
                    value = $.trim(value);
                    $this.find('input[type="radio"][value="'+value+'"]').prop("checked", true);
                });
            }
        });

        // @since 1.1.8     - set checkbox to correct value
        $('.super-field.super-checkbox').each(function(){
            var $this = $(this);
            var $value = $this.find('.super-shortcode-field').val();
            if( typeof $value !== 'undefined' ) {
                var $value = $value.split(',');
                $this.find('input[type="checkbox"]').prop("checked", false);
                $.each($value, function( index, value ) {
                    value = $.trim(value);
                    $this.find('input[type="checkbox"][value="'+value+'"]').prop("checked", true);
                });
            }
        });

        // @since 1.3   - input mask
        $('.super-shortcode-field[data-mask]').each(function(){
            $(this).mask($(this).data('mask'));
        });

        // Multi-part
        $('.super-form').each(function(){
            var $form = $(this);
            var $total = $form.find('.super-multipart').length;
            if( $total!=0 ) {
                var $multipart = {};
                var $multiparts =  [];

                // Lets check if this form has already rendered the multi-parts
                if( !$form.find('.super-multipart:eq(0)').hasClass('super-rendered') ) {

                    // First Multi-part should be set to active automatically
                    $form.find('.super-multipart:eq(0)').addClass('active').addClass('super-rendered');
                    
                    var $submit_button = $form.find('.super-form-button:last');
                    $clone = $submit_button.clone();
                    $($clone).appendTo($form.find('.super-multipart:last'));
                    var $button_html = $submit_button.find('.super-button-name').html();
                    var $button_name = $submit_button.find('.super-button-name').text();
                    var $button_clone = $submit_button[0].outerHTML;
                    $submit_button.remove();
                    $($button_clone).appendTo($form.find('.super-multipart').not(':last')).removeClass('super-form-button').addClass('super-next-multipart').find('.super-button-name').html(super_common_i18n.directions.next);
                    $($button_clone).appendTo($form.find('.super-multipart').not(':first')).removeClass('super-form-button').addClass('super-prev-multipart').find('.super-button-name').html(super_common_i18n.directions.prev);

                    // Now lets loop through all the multi-parts and set the data such as name and description
                    $form.find('.super-multipart').each(function(){
                        
                        if( typeof $(this).data('prev-text') === 'undefined' ) {
                            var $prev = super_common_i18n.directions.prev;
                        }else{
                            var $prev = $(this).data('prev-text');
                        }
                        if( typeof $(this).data('next-text') === 'undefined' ) {
                            var $next = super_common_i18n.directions.next;
                        }else{
                            var $next = $(this).data('next-text');
                        }
                        $(this).find('.super-prev-multipart .super-button-name').html($prev);
                        $(this).find('.super-next-multipart .super-button-name').html($next);

                        $multipart = {
                            name: $(this).data('step-name'),
                            description: $(this).data('step-description'),
                            icon: $(this).data('icon'),
                        }
                        $multiparts.push($multipart);

                    });

                    // Lets setup the progress steps
                    var $progress_steps  = '<ul class="super-multipart-steps">';
                    $.each($multiparts, function( index, value ) {
                        if($total==1){
                            $progress_steps += '<li class="super-multipart-step active last-step">';
                        }else{
                            if((index==0) && ($total != (index+1))){
                                $progress_steps += '<li class="super-multipart-step active">';
                            }else{
                                if($total == (index+1)){
                                    $progress_steps += '<li class="super-multipart-step last-step">';
                                }else{
                                    $progress_steps += '<li class="super-multipart-step">';
                                }
                            }
                        }
                        $progress_steps += '<span class="super-multipart-step-wrapper">';
                        $progress_steps += '<span class="super-multipart-step-icon"><i class="fa fa-'+value.icon+'"></i></span>';
                        $progress_steps += '<span class="super-multipart-step-count">'+(index+1)+'</span>';
                        if( value.name!='' ) {
                            $progress_steps += '<span class="super-multipart-step-name">'+value.name+'</span>';
                        }
                        if( value.description!='' ) {
                            $progress_steps += '<span class="super-multipart-step-description">'+value.description+'</span>';
                        }
                        $progress_steps += '</span>';
                        $progress_steps += '</li>';
                    });
                    $progress_steps += '</ul>';
                    $form.prepend($progress_steps);

                    // Here we set the correct progress bar in percentages
                    var $progress = 100 / $total;
                    var $progress_bar  = '<div class="super-multipart-progress">';
                        $progress_bar += '<div class="super-multipart-progress-inner">';
                        $progress_bar += '<div class="super-multipart-progress-bar" style="width:'+$progress+'%"></div>';
                        $progress_bar += '</div>';
                        $progress_bar += '</div>';
                    $form.prepend($progress_bar);
                }
            }
        });
        
        SUPER.init_super_responsive_form_fields();

        //Init popups 
        SUPER.init_tooltips();
  
        //Init distance calculator 
        SUPER.init_distance_calculators();

        //Init reCAPTCHA
        SUPERreCaptcha();

        //Init datepicker
        SUPER.init_datepicker();

        //Init masked input
        SUPER.init_masked_input();

        //Init currency input
        SUPER.init_currency_input();

        //Init color pickers
        SUPER.init_colorpicker();

        //Init button colors
        SUPER.init_button_colors();

        //Init skype
        SUPER.init_skype();
        
        //Init dropdowns
        SUPER.init_dropdowns();

        //Init sliders
        SUPER.init_slider_field();
        
        // @since 3.1.0 - init google places autocomplete
        SUPER.google_maps_init();

        // @since 3.7.0 - set correct input width for keyword tags fields
        SUPER.set_keyword_tags_width();


        $(window).resize(function() {
            SUPER.init_super_responsive_form_fields();
        });
        
        var $handle_columns_interval = setInterval(function(){
            if(($('.super-form').length != $('.super-form.super-rendered').length) || ($('.super-form').length==0)){
                SUPER.handle_columns();
            }else{
                clearInterval($handle_columns_interval);
            }
        }, 100);
        
    }

    // @since 3.7.0 - set correct input width for keyword tags fields
    SUPER.set_keyword_tags_width = function($field){
        if(typeof $field === 'undefined'){
            var $field = $('.super-form .super-keyword-tags');
        }
        $field.each(function(){
            var $this = $(this);
            var $width = $this.outerWidth(true);
            var $wrapper_width = $this.find('.super-field-wrapper').width();

            var $icon_width = 0;
            if($wrapper_width>=$width){
                var $icon_width = $this.find('.super-icon').outerWidth(true);
                var $width = $width-$icon_width;
            }else{
                $width = $wrapper_width;
            }

            var $autosuggest = $this.find('.super-autosuggest-tags.super-shortcode-field');
            $autosuggest.children('div').css('margin-left','');

            var $padding = $autosuggest.innerWidth() - $autosuggest.width();
            $width = $width - $padding + $icon_width;

            var $total_width = 0;
            $autosuggest.find('div > span').each(function(){
                $total_width = $total_width + $(this).outerWidth(true);
            });

            // Set input field to width 0px so we know what the margin/padding is
            $autosuggest.children('input').css('width','0px');
            var $input_margins = $autosuggest.children('input').outerWidth(true);

            var $new_width = $width-$total_width-$input_margins-3;
            $autosuggest.children('input').css('width',$new_width+'px');

            // Let's check if we have to move the tags up to the left a bit, in case we do not have enough space for the input field.
            // This prevents the input field moving below the tags because of insufficient space
            var $min_input_width = parseFloat($autosuggest.width()/2).toFixed(0);
            var $min_input_width = parseFloat($min_input_width);

            if($total_width>$min_input_width){
                var $margin = $total_width - $min_input_width;
                $autosuggest.children('div').css('margin-left',-$margin+'px');
                $autosuggest.children('input').css('width',($min_input_width-$input_margins-3)+'px');
            }else{
                $autosuggest.children('div').css('margin-left','');
                $autosuggest.children('input').css('width',$new_width+'px');
            }
        });
    }

    // Init Slider fields
    SUPER.init_slider_field = function(){
        $('.super-slider').each(function () {
            var $this = $(this);
            if( $this.find('.slider').length==0 ) {
                var $field = $this.find('.super-shortcode-field');
                var $steps = $field.data('steps');
                var $min = $field.data('minnumber');
                var $max = $field.data('maxnumber');
                var $currency = $field.data('currency');
                var $format = $field.data('format');
                var $value = $field.val();
                var $decimals = $field.data('decimals');
                var $thousand_separator = $field.data('thousand-separator');
                var $decimal_separator = $field.data('decimal-separator');
                var $regular_expression = '\\d(?=(\\d{' + (3 || 3) + '})+' + ($decimals > 0 ? '\\D' : '$') + ')';
                if( $value<$min ) {
                    $value = $min;
                }
                var $value = parseFloat($value).toFixed(Math.max(0, ~~$decimals));
                var $value = ($decimal_separator ? $value.replace('.', $decimal_separator) : $value).replace(new RegExp($regular_expression, 'g'), '$&' + ($thousand_separator || ''));
                $field.simpleSlider({
                    snap: true,
                    step: $steps,
                    range: [$min, $max],
                    animate: false
                });
                var $wrapper = $field.parents('.super-field-wrapper:eq(0)');
                var $slider = $wrapper.find('.slider');
                $wrapper.append('<span class="amount"><i>'+$currency+''+$value+''+$format+'</i></span>');
                $slider_width = $slider.outerWidth(true);
                $amount_width = $wrapper.children('.amount').outerWidth(true);
                $position = $slider.find('.dragger').position();
                if( (($position.left+$amount_width) + 5) < $slider_width ) {
                    $wrapper.children('.amount').css('left', $position.left+'px');
                }
                $field.bind("slider:changed", function (event, data) {
                    var $number = parseFloat(data.value).toFixed(Math.max(0, ~~$decimals));
                    var $number = ($decimal_separator ? $number.replace('.', $decimal_separator) : $number).replace(new RegExp($regular_expression, 'g'), '$&' + ($thousand_separator || ''));
                    var amount = $wrapper.children('.amount');
                    var dragger = data.el[0].querySelector('.dragger');
                    amount.children('i').html($currency+''+($number)+''+$format);
                    setTimeout(function(){
                        var slider_width = data.el[0].offsetWidth;
                        var amount_width = amount[0].offsetWidth;
                        var dragger_margin_left = dragger.style.marginLeft.replace('px','');
                        if(dragger_margin_left<0){
                            dragger_margin_left = -dragger_margin_left;
                        }
                        var offset_left = dragger.offsetLeft + dragger_margin_left;
                        // If offset doesn't have to be less than 0
                        if(offset_left<0){
                            offset_left = 0;
                        }
                        if(slider_width < (offset_left + amount_width)){
                            amount.css('right', '0px');
                            amount.css('left', 'inherit');
                        }else{
                            amount.css('right', 'inherit');
                            amount.css('left', offset_left+'px');
                        }
                    },1);
                });
            }
        });
        $('.slider-field').each(function () {
            var $this = $(this);
            if($this.children('.slider').length==0){
                var $field = $this.children('input');
                var $steps = $field.data('steps');
                var $min = $field.data('min');
                var $max = $field.data('max');
                $field.simpleSlider({
                    snap: true,
                    step: $steps,
                    range: [$min, $max]
                });
                $field.show();
            }
        });
    }

    // Init Tooltips
    SUPER.init_tooltips = function(){
        if ( $.isFunction($.fn.tooltipster) ) {
            $('.super-tooltip:not(.tooltipstered)').tooltipster({
                contentAsHTML: true,
            });
        }
    }

    // Init color pickers
    SUPER.init_color_pickers = function(){
        if ( $.isFunction($.fn.wpColorPicker) ) {
            $('.super-color-picker').each(function(){
                if($(this).find('.wp-picker-container').length==0){
                    $(this).children('input').wpColorPicker({
                        palettes: ['#F26C68', '#444444', '#6E7177', '#FFFFFF', '#000000']
                    });
                }
            });
        }
    }

    // Handle the responsiveness of the form
    SUPER.init_super_responsive_form_fields = function(){
        var $classes = [
            'super-first-responsiveness',
            'super-second-responsiveness',
            'super-third-responsiveness',
            'super-fourth-responsiveness',
            'super-last-responsiveness'
        ];
        var $window_classes = [
            'super-window-first-responsiveness',
            'super-window-second-responsiveness',
            'super-window-third-responsiveness',
            'super-window-fourth-responsiveness',
            'super-window-last-responsiveness'
        ];

        var $new_class = '';
        var $new_window_class = '';
        var $window_width = $(window).outerWidth(true);

        $('.super-form').each(function(){

            var $this = $(this);
            var $width = $(this).outerWidth(true);

            if($width > 0 && $width < 530){
                SUPER.remove_super_form_classes($this,$classes);
                $this.addClass($classes[0]);
                $new_class = $classes[0];
            }
            if($width >= 530 && $width < 760){
                SUPER.remove_super_form_classes($this,$classes);
                $this.addClass($classes[1]);
                $new_class = $classes[1];
            }
            if($width >= 760 && $width < 1200){
                SUPER.remove_super_form_classes($this,$classes);
                $this.addClass($classes[2]);
                $new_class = $classes[2];
            }
            if($width >= 1200 && $width < 1400){
                SUPER.remove_super_form_classes($this,$classes);
                $this.addClass($classes[3]);
                $new_class = $classes[3];
            }
            if($width >= 1400){
                SUPER.remove_super_form_classes($this,$classes);
                $this.addClass($classes[4]);
                $new_class = $classes[4];
            }

            // @since 1.9 - add the window width responsiveness classes
            if($window_width > 0 && $window_width < 530){
                SUPER.remove_super_form_classes($this,$window_classes);
                $this.addClass($window_classes[0]);
                $new_window_class = $window_classes[0];
            }
            if($window_width >= 530 && $window_width < 760){
                SUPER.remove_super_form_classes($this,$window_classes);
                $this.addClass($window_classes[1]);
                $new_window_class = $window_classes[1];
            }
            if($window_width >= 760 && $window_width < 1200){
                SUPER.remove_super_form_classes($this,$window_classes);
                $this.addClass($window_classes[2]);
                $new_window_class = $window_classes[2];
            }
            if($window_width >= 1200 && $window_width < 1400){
                SUPER.remove_super_form_classes($this,$window_classes);
                $this.addClass($window_classes[3]);
                $new_window_class = $window_classes[3];
            }
            if($window_width >= 1400){
                SUPER.remove_super_form_classes($this,$window_classes);
                $this.addClass($window_classes[4]);
                $new_window_class = $window_classes[4];
            }

            // @since 3.2.0 - check if RTL support is enabled, if so we must revert column order on mobile devices
            if( $this.hasClass('super-rtl') ) {
                if( (!$this.hasClass('super-rtl-reversed')) && ($new_class=='super-first-responsiveness') ) {
                    $this.find('.super-grid').each(function(){
                        var $grid = $(this);
                        var $columns = $grid.children('div.super-column:not(.super-not-responsive)');
                        $grid.append($columns.get().reverse());
                        $grid.children('div.super-column:last-child').removeClass('first-column');
                        $grid.children('div.super-column:eq(0)').addClass('first-column');
                    });
                    $this.addClass('super-rtl-reversed');
                }else{
                    if( ($this.hasClass('super-rtl-reversed')) && ($new_class!='super-first-responsiveness') ) {
                        $this.find('.super-grid').each(function(){
                            var $grid = $(this);
                            var $columns = $grid.children('div.super-column:not(.super-not-responsive)');
                            $grid.append($columns.get().reverse());
                            $grid.children('div.super-column:last-child').removeClass('first-column');
                            $grid.children('div.super-column:eq(0)').addClass('first-column');
                        });
                        $this.removeClass('super-rtl-reversed');
                    }
                }
            }
        });

        // @since 3.7.0 
        SUPER.set_keyword_tags_width();

        // @since 1.3
        SUPER.after_responsive_form_hook($classes, $new_class, $window_classes, $new_window_class);

    }

    // Update field visibility
    SUPER.init_field_filter_visibility = function($this) {
        if(typeof $this ==='undefined'){
            $('.super-elements-container .field.filter[data-filtervalue], .super-settings .super-field.filter[data-filtervalue]').addClass('hidden');
            $('.super-elements-container .field.filter[data-filtervalue], .super-settings .super-field.filter[data-filtervalue]').each(function(){
                var $this = $(this);
                var $container = $this.parents('.super-elements-container:eq(0)');
                if($container.length==0){
                    var $container = $this.parents('.super-settings:eq(0)');
                }
                var $parent = $this.data('parent');
                var $filtervalue = $this.data('filtervalue');
                var $parent = $container.find('.element-field[name="'+$parent+'"]');
                var $value = $parent.val();
                if(typeof $value==='undefined') var $value = '';
                var $parent = $parent.parents('.field.filter:eq(0)');

                var $visibility = $parent.hasClass('hidden');
                if($visibility==true){
                    $visibility = 'hidden';
                }else{
                    $visibility = 'visible';
                }
                var $filtervalues = $filtervalue.toString().split(',');
                var $string_value = $value.toString();
                var $match_found = false;
                $.each($filtervalues, function( index, value ) {
                    if( value==$string_value ) {
                        $match_found = true;
                    }
                });
                if( ($value!='') && ($match_found) && ($visibility!='hidden') ) {
                    $this.removeClass('hidden');
                }else{
                    $this.addClass('hidden');
                }
                SUPER.init_field_filter_visibility($this);
            });
        }else{
            var $name = $this.find('.element-field').attr('name');
            $('.super-elements-container .field[data-parent="'+$name+'"], .super-settings .super-field[data-parent="'+$name+'"]').each(function(){
                var $this = $(this);
                var $container = $this.parents('.super-elements-container:eq(0)');
                if($container.length==0){
                    var $container = $this.parents('.super-settings:eq(0)');
                }
                var $parent = $this.data('parent');
                var $filtervalue = $this.data('filtervalue');
                var $parent = $container.find('.element-field[name="'+$parent+'"]');
                var $value = $parent.val();
                if(typeof $value==='undefined') var $value = '';
                var $parent = $parent.parents('.field.filter:eq(0)');

                var $visibility = $parent.hasClass('hidden');
                if($visibility==true){
                    $visibility = 'hidden';
                }else{
                    $visibility = 'visible';
                }
                var $filtervalues = $filtervalue.toString().split(',');
                var $string_value = $value.toString();
                var $match_found = false;
                $.each($filtervalues, function( index, value ) {
                    if( value==$string_value ) {
                        $match_found = true;
                    }
                });
                if( ($value!='') && ($match_found) && ($visibility!='hidden') ) {
                    $this.removeClass('hidden');
                }else{
                    $this.addClass('hidden');
                }
                SUPER.init_field_filter_visibility($this);
            });
        }
    }


    // @since 3.1.0 - init distance calculator fields
    SUPER.init_distance_calculators = function(){
        $('.super-form .super-text .super-distance-calculator').each(function() {
            var $this = $(this);
            var $form = $this.parents('.super-form:eq(0)');
            var $method = $this.data('distance-method');
            if($method=='start'){
                var $destination = $this.data('distance-destination');
                var $destination_field = $form.find('.super-shortcode-field[name="'+$destination+'"]');
                $destination_field.attr('data-distance-start',$this.attr('name'));
            }
        });
    }


    // @since 3.2.0 - function to return next field based on TAB index
    SUPER.super_find_next_tab_field = function($field, $form, $next_tab_index){
        if(typeof $next_tab_index === 'undefined'){
            var $next_tab_index_small_increment = parseFloat(parseFloat($field.attr('data-super-tab-index'))+0.001).toFixed(3);
            var $next_tab_index = parseFloat($field.attr('data-super-tab-index'))+1;
        }
        if(typeof $field.attr('data-super-custom-tab-index') !== 'undefined'){
            var $next_tab_index = parseFloat($field.attr('data-super-custom-tab-index'))+1;
        }

        var $next_tab_index_small_increment = parseFloat($next_tab_index_small_increment);
        var $next_tab_index = parseFloat(parseFloat($next_tab_index).toFixed(0));
        var $next_field_small_increment = $form.find('.super-field[data-super-tab-index="'+$next_tab_index_small_increment+'"]');
        if($next_field_small_increment.length){
            var $next_field = $next_field_small_increment;
        }else{
            var $next_field = $form.find('.super-field[data-super-tab-index="'+$next_tab_index+'"]');
        }
        var $next_custom_field = $form.find('.super-field[data-super-custom-tab-index="'+$next_tab_index+'"]');

        // If custom index TAB field was found, and is not currently focussed
        if( ($next_custom_field.length) && (!$next_custom_field.hasClass('super-focus')) ) {
            $next_field = $next_custom_field;
        }
        
        var $custom_tab_index = $next_field.attr('data-super-custom-tab-index');
        if(typeof $custom_tab_index !== 'undefined') {
            if($next_tab_index < parseFloat($custom_tab_index)){
                $next_field = SUPER.super_find_next_tab_field($field, $form, $next_tab_index+1);
            }
        }
        var $hidden = false;
        $next_field.parents('.super-shortcode.super-column').each(function(){
            if($(this).css('display')=='none'){
                $hidden = true;
            }
        });
        if( ( $next_field.css('display')=='none' ) || ( $next_field.hasClass('super-hidden') ) ) {
            $hidden = true;
        }
        var $parent = $next_field.parents('.super-shortcode:eq(0)');
        if( ( $hidden==true )  || ( ( $parent.css('display')=='none' ) && ( !$parent.hasClass('super-hidden') ) ) ) {
            // Exclude conditionally
            $next_field = SUPER.super_find_next_tab_field($field, $form, $next_tab_index+1);
        }
        return $next_field;
    }
    SUPER.super_focus_next_tab_field = function(e, $next, $form, $skip_next){
        if(typeof $skip_next !== 'undefined'){
            var $next = $skip_next;
        }else{
            var $next = SUPER.super_find_next_tab_field($next, $form);
        }
        $form.find('.super-focus *').blur();
        $form.find('.super-focus').removeClass('super-focus');
        $form.find('.super-focus-dropdown').removeClass('super-focus-dropdown');
        $form.find('.super-color .super-shortcode-field').each(function(){
            $(this).spectrum("hide");
        });
        if( $next.hasClass('super-form-button') ) {
            $next.addClass('super-focus');
            SUPER.init_button_hover_colors( $next );
            $next.find('a').focus();
            e.preventDefault();
            return false;
        }
        if( $next.hasClass('super-next-multipart') ) {
            var keyCode = e.keyCode || e.which; 
            // 9 = TAB
            if (keyCode == 9) {
                $next.click().addClass('super-focus');
                SUPER.super_focus_next_tab_field(e, $next, $form);
            }
            e.preventDefault();
            return false;
        }
        if( $next.hasClass('super-color')) {
            $next.addClass('super-focus');
            $next.find('.super-shortcode-field').spectrum('show');
            e.preventDefault();
            return false;
        }
        if( ($next.hasClass('super-dropdown')) || ($next.hasClass('super-countries')) ) {
            $next.addClass('super-focus').addClass('super-focus-dropdown');
            if($next.find('input[name="super-dropdown-search"]').length){
                $next.find('input[name="super-dropdown-search"]').focus();
                e.preventDefault();
                return false;
            }
        }else{
            $next.addClass('super-focus');
        }
        $next.find('.super-shortcode-field').focus();
        e.preventDefault();
        return false;
    }

    jQuery(document).ready(function ($) {
        
        var $doc = $(document);

        // Fix chrome autofill honeypot issue
        var $super_hp = $doc.find('input[name="super_hp"]');
        window.setInterval(function() {
            $super_hp.each(function(){
                var hasValue = $(this).val().length > 0; //Normal
                if(!hasValue){
                    if($(this).is("\\:-webkit-autofill")) {
                        hasValue = true;
                    }
                }
                if (hasValue) {
                    $super_hp.val('');
                }
            });
        }, 1000);

        // @since 3.1.0 - google distance calculation between 2 addresses
        $doc.on('change', '.super-form .super-text .super-distance-calculator', function(){
            SUPER.calculate_distance($(this));
        });

        SUPER.init_field_filter_visibility();
        $doc.on('change keyup keydown blur','.field-container.filter, .field.filter, .super-field.filter',function(){
            SUPER.init_field_filter_visibility($(this));
        });  
        
        function super_update_dropdown_value(e, $dropdown, $key){
            var $input = $dropdown.find('.super-field-wrapper').children('input');
            var $parent = $dropdown.find('.super-dropdown-ui');
            var $placeholder = $parent.find('.super-placeholder');
            var $selected = $parent.find('.super-active');
            var $multiple = false;
            if($parent.hasClass('multiple')) $multiple = true;
            if($multiple==false){
                var $value = $selected.attr('data-value');
                var $name = $selected.attr('data-search-value');
                $placeholder.html($name).attr('data-value',$value).addClass('super-active');
                $parent.find('li').removeClass('super-active');
                $selected.addClass('super-active');
                $input.val($value);
            }else{
                var $max = $input.attr('data-maxlength');
                var $min = $input.attr('data-minlength');
                var $total = $parent.find('li.super-active:not(.super-placeholder)').length;
                if($selected.hasClass('super-active')){
                    if($total>1){
                        if($total <= $min) return false;
                        $selected.removeClass('super-active');    
                    }
                }else{
                    if($total >= $max) return false;
                    $selected.addClass('super-active');    
                }
                var $names = '';
                var $values = '';
                var $total = $parent.find('li.super-active:not(.super-placeholder)').length;
                var $counter = 1;
                $parent.find('li.super-active:not(.super-placeholder)').each(function(){
                    if(($total == $counter) || ($total==1)){
                        $names += $(this).attr('data-search-value');
                        $values += $(this).attr('data-value');
                    }else{
                        $names += $(this).attr('data-search-value')+', ';
                        $values += $(this).attr('data-value')+', ';
                    }
                    $counter++;
                });
                $placeholder.html($names);
                $input.val($values);
            }
            if($key=='enter') $dropdown.removeClass('super-focus-dropdown').removeClass('super-string-found');
            SUPER.after_dropdown_change_hook($input);
            e.preventDefault();
        }

        $doc.on('click', '.super-field.super-currency',function(){
            var $field = $(this);
            var $form = $field.parents('.super-form:eq(0)');
            $form.find('.super-focus').removeClass('super-focus');
            $form.find('.super-focus-dropdown').removeClass('super-focus-dropdown');
            $field.addClass('super-focus');
        });



        $doc.keydown(function(e){
            var keyCode = e.keyCode || e.which; 
            // 13 = enter
            if (keyCode == 13) {
                var $dropdown = $('.super-focus-dropdown');
                if($dropdown.length){
                    super_update_dropdown_value(e, $dropdown, 'enter');
                }else{
                    var $element = $('.super-focus');
                    var $form = $element.parents('.super-form:eq(0)');
                    
                    // @since 3.3.0 - Do not submit form if Enter is disabled
                    if($form.data('disable-enter')==true){
                        e.preventDefault();
                        return false;
                    }
                    
                    var $element = $('.super-focus');
                    if( ($element.length) && (!$element.hasClass('super-textarea') ) ) {
                        if(!$form.find('.super-form-button.super-loading').length){
                            SUPER.before_validating_form_hook(undefined, $form);
                            $submit_button = $form.find('.super-form-button .super-button-wrap');
                            SUPER.validate_form( $form, $submit_button, undefined, e );
                            SUPER.after_validating_form_hook();
                        }
                        e.preventDefault();
                    }
                }
            }
            // 38 = up arrow
            // 40 = down arrow
            if ( (keyCode == 40) || (keyCode == 38) ) {
                var $dropdown = $('.super-focus-dropdown');
                if($dropdown.length){
                    var $placeholder = $dropdown.find('.super-dropdown-ui .super-placeholder');;
                    if(!$dropdown.find('.super-dropdown-ui .super-active').length){
                        var $item = $dropdown.find('.super-dropdown-ui li:eq(1)');
                        if(keyCode == 38){
                            var $item = $dropdown.find('.super-dropdown-ui li:last-child');
                        }
                        $item.addClass('super-active');
                        $placeholder.attr('data-value', $item.data('value')).html($item.html());
                    }else{
                        var $current = $dropdown.find('.super-dropdown-ui li.super-active');
                        if(keyCode == 38){
                            var $next_index = $current.index() - 1;
                            if($next_index==0){
                                $next_index = $dropdown.find('.super-dropdown-ui li:last-child').index();
                            }
                        }else{
                            var $next_index = $current.index() + 1;
                        }
                        var $item = $dropdown.find('.super-dropdown-ui li:eq('+$next_index+')');
                        if($item.length==0){
                            var $item = $dropdown.find('.super-dropdown-ui li:eq(1)');
                        }
                        $dropdown.find('.super-dropdown-ui li.super-active').removeClass('super-active');
                        $placeholder.attr('data-value', $item.data('value')).html($item.html());
                        $item.addClass('super-active');
                    }
                    var $dropdown_ui = $dropdown.find('.super-dropdown-ui');
                    $dropdown_ui.scrollTop($dropdown_ui.scrollTop() - $dropdown_ui.offset().top + $item.offset().top - 50); 
                    super_update_dropdown_value(e, $dropdown);
                }
            }
            // 9 = TAB
            if (keyCode == 9) {
                // Only possible to switch to next field if a field is already focussed
                var $field = $('.super-field.super-focus');
                if( $field.length ) {
                    var $form = $field.parents('.super-form:eq(0)');
                    SUPER.super_focus_next_tab_field(e, $field, $form);
                }     
            }
        });

        $doc.on('keyup', '.super-icon-search input', function(){
            var $value = $(this).val();
            var $icons = $(this).parents('.super-icon-field').children('.super-icon-list').children('i');
            if($value==''){
                $icons.css('display','inline-block');   
            }else{
                $icons.each(function(){
                    if($(this).is('[class*="'+$value+'"]')) {
                        $(this).css('display','inline-block');
                    }else{
                        $(this).css('display','none');
                    }
                });
            }
        });

        $doc.on('click','.super-icon-list i',function(){
            if($(this).hasClass('active')){
                $(this).parent().find('i').removeClass('active');
                $(this).parents('.super-icon-field').find('input').val('');
            }else{
                $(this).parent().find('i').removeClass('active');
                $(this).parents('.super-icon-field').find('input').val($(this).attr('class').replace('fa fa-',''));
                $(this).addClass('active');
            }
        });

        var timeout = null;
        $doc.on('keyup', '.super-text .super-shortcode-field[data-search="true"]', function(){ 
            var $this = $(this);
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                SUPER.populate_form_data_ajax($this);
            }, 1000);
        });

        var timeout2 = null;
        $doc.on('keyup', '.super-text .super-shortcode-field[data-wcosm]', function(){ 
            var $this = $(this);
            if (timeout2 !== null) {
                clearTimeout(timeout2);
            }
            timeout2 = setTimeout(function () {
                var $value = $this.val();
                var $method = $this.data('wcosm');
                var $filterby = $this.data('wcosfb');
                var $return_label = $this.data('wcosrl');
                var $return_value = $this.data('wcosrv');
                var $populate = $this.data('wcosp');
                var $skip = $this.data('wcoss');
                var $status = $this.data('wcosst');
                var $form = $this.parents('.super-form:eq(0)');
                if( $value.length>0 ) {
                    $this.parents('.super-field-wrapper:eq(0)').addClass('super-populating');
                    $form.addClass('super-populating');
                    $.ajax({
                        url: super_common_i18n.ajaxurl,
                        type: 'post',
                        data: {
                            action: 'super_search_wc_orders',
                            value: $value,
                            method: $method,
                            filterby: $filterby,
                            return_label: $return_label,
                            return_value: $return_value,
                            populate: $populate,
                            skip: $skip,
                            status: $status
                        },
                        success: function (result) {
                            if(result!=''){
                                $this.parents('.super-shortcode:eq(0)').addClass('super-focus');
                                $this.parents('.super-shortcode:eq(0)').addClass('super-string-found');
                            }
                            var ul = $this.parents('.super-field-wrapper:eq(0)').children('.super-dropdown-ui');
                            if(ul.length){
                                ul.html(result);
                            }else{
                                $('<ul class="super-dropdown-ui">'+result+'</ul>').appendTo($this.parents('.super-field-wrapper:eq(0)'));
                            }
                        },
                        complete: function(){
                            $this.parents('.super-field-wrapper:eq(0)').removeClass('super-populating');
                            $form.removeClass('super-populating');
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr, ajaxOptions, thrownError);
                            alert('Failed to process data, please try again');
                        }
                    });
                }
            }, 1000);
        });

        SUPER.init_slider_field();
        SUPER.init_tooltips();
        SUPER.init_distance_calculators();
        SUPER.init_color_pickers();
        SUPER.init_text_editors();
        
    });

})(jQuery);