jQuery,jQuery(document).ready(function(o){o(document).on("click",".super-form-button > .super-button-wrap",function(t){var n=o(this).parents(".super-form:eq(0)");return SUPER.conditional_logic(void 0,n),SUPER.validate_form(n,o(this),void 0,t),!1}),SUPER.init_tooltips(),SUPER.init_distance_calculators(),SUPER.init_super_form_frontend(),o(document).ajaxComplete(function(){SUPER.init_super_form_frontend()})});