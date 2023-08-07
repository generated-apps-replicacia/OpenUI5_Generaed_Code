sap.ui.define([], function () {
	"use strict";

	return {

		tierIcon: function (tierName) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			switch (tierName) {
				case "database":
					return "sap-icon://database";
				case "backend":
					return "sap-icon://technical-object";
				case "ui":
					return "sap-icon://my-view";
				default:
					return "sap-icon://process";
			}
		}
	};
});