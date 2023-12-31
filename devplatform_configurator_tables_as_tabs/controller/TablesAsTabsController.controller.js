sap.ui.define(['sap/ui/core/mvc/Controller', 
			'sap/ui/model/json/JSONModel', 
			'sap/m/MessageToast', 
			'sap/m/TabContainerItem', 
			'sap/m/MessageBox',
			'../model/formatter'],
	function (Controller, JSONModel, MessageToast, TabContainerItem, MessageBox, formatter) {
		"use strict";

		return Controller.extend("com.devplatform.config.controller.TablesAsTabsController", {

			formatter: formatter,
			
			onInit: function () {
				var oModel = new JSONModel();
				oModel.setData({
					employees: [
						{
							name: "Jean Doe",
							empFirstName: "Jean",
							empLastName: "Doe",
							position: "Senior Developer",
							icon: "./images/Woman_05.png",
							iconTooltip: "group",
							salary: 1455.22
						},
						{
							name: "John Smith",
							empFirstName: "John",
							empLastName: "Smith",
							position: "Developer",
							icon: "sap-icon://notes",
							iconTooltip: "notes",
							salary: 1390.77,
							modified: true
						},
						{
							name: "Particia Clark",
							empFirstName: "Particia",
							empLastName: "Clark",
							position: "Developer",
							icon: "sap-icon://group",
							iconTooltip: "group",
							salary: 1189.00
						},
						{
							name: "Tim McAfeed",
							empFirstName: "Tim",
							empLastName: "McAfeed",
							position: "Junior Developer",
							icon: "sap-icon://group",
							iconTooltip: "group",
							salary: 1235.37
						}
					]
				});
				//this.getView().setModel(oModel);
				
				
			},
			
			onAfterRendering: function(oEvent){
				/*
				var metaModel = this.getView().getModel().getMetaModel();
				metaModel.mSchema2MetadataUrl;
				metaModel.sUrl;
				*/
				
				/*var tiersTableView = this.byId("tiersTableView");
				var tiersTableViewName = tiersTableView.getViewName();
				
				console.log("entity table view name: "+ tiersTableViewName);
				
				var oTabContainer = this.byId("myTabContainer");
				
				if (oTabContainer) {
					oTabContainer.getItems().forEach(function (oTabItem) {
						console.log("tabItem name: "+ oTabItem.getName() );
					});
				}*/
				
			},
			onItemSelected: function(oEvent) {
				var oItem = oEvent.getSource();
				MessageToast.show(
					'Item ' + oItem.getName() + " was selected"
				);
			},
			addNewButtonPressHandler : function() {
				var newEmployee = new TabContainerItem({
					name: "New employee",
					additionalText: "Developer",
					icon: "sap-icon://group",
					iconTooltip: "group",
					modified: false
				});

				var tabContainer = this.byId("myTabContainer");

				tabContainer.addItem(
					newEmployee
				);
				tabContainer.setSelectedItem(
					newEmployee
				);
			},

			itemCloseHandler: function(oEvent) {
				// prevent the tab being closed by default
				oEvent.preventDefault();

				var oTabContainer = this.byId("myTabContainer");
				var oItemToClose = oEvent.getParameter('item');

				MessageBox.confirm("Do you want to close the tab '" + oItemToClose.getName() + "'?", {
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							oTabContainer.removeItem(oItemToClose);
							MessageToast.show("Item closed: " + oItemToClose.getName(), {duration: 500});
						} else {
							MessageToast.show("Item close canceled: " + oItemToClose.getName(), {duration: 500});
						}
					}
				});
			}
		});
	});
