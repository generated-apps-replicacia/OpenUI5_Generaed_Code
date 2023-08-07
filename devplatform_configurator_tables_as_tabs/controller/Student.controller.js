 

sap.ui.define([
	"jquery.sap.global",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/library"
], function (jQuery, Text, TextArea, Label, Button, Dialog, Controller, Device, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel, Log, Menu, MenuItem, mobileLibrary) {
	"use strict";
	
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;
	
	//var startTime = null;
	//var endTime = null;
		
	var _activeRow = {  };
	
	/* 
	 * 	Below is configuration that should be changed by the developer
	 *	Below is the mapping of field and cell index
	 *  
	 **/
	var cellIndexes = { };
				cellIndexes.Name = 0;		
				cellIndexes.PhoneNo = 1;		
				cellIndexes.Email = 2;		
				cellIndexes.StudentId = 3;		
		

	return Controller.extend("com.devplatform.config.controller.Student", {
		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			this._mViewSettingsDialogs = {};
			this.mGroupFunctions = {
					Name: function(oContext) {
						var name = oContext.getProperty("Name");
						return {
							key: name,
							text: name
						};
					},					
					PhoneNo: function(oContext) {
						var name = oContext.getProperty("PhoneNo");
						return {
							key: name,
							text: name
						};
					},					
					Email: function(oContext) {
						var name = oContext.getProperty("Email");
						return {
							key: name,
							text: name
						};
					},					
					StudentId: function(oContext) {
						var name = oContext.getProperty("StudentId");
						return {
							key: name,
							text: name
						};
					}					
				
				};
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
					new Filter("technical", FilterOperator.EQ, true)),
				oViewModel = new JSONModel({
					busy : false,
					hasUIChanges : false,
					usernameEmpty : true,
					order : 0
				});
			this.getView().setModel(oViewModel, "appView");
			this.getView().setModel(oMessageModel, "message_layers");

			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this._bTechnicalErrors = false;
			//this.getView().getModel().setDefaultBindingMode(BindingMode.OneWay);
		},


		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */
		
		onChangeHandler: function(oEvent){
			var eventName = oEvent.getParameter("reason");
			console.log("Change: Event raised: " + eventName + ", timestamp = " + new Date().getTime());
			
		},
		
		__isNumeric: function( val ){
			return !isNaN( val );
		},
		
		_getValueType: function( fieldCellValue ){			
			if( fieldCellValue != undefined ){
			  //if( this.__isNumeric( fieldCellValue ) ) // Not working for boolean values
			  if( Number.isInteger(fieldCellValue) )
				 return eval( fieldCellValue );
			  else if( typeof fieldCellValue == "string" )
				return fieldCellValue;
			  else if( typeof fieldCellValue == "boolean" )
				return fieldCellValue;
			  else if( typeof fieldCellValue == null )
				return fieldCellValue;
			  else //if( typeof fieldCellValue == "object" )
				return fieldCellValue;
			}else{ 
				return fieldCellValue; 
			}			
		},
				
		
		_getUIControlValue: function(cell){
			var control_type = cell.getMetadata()._sClassName;
			var control_value;
			
			if( control_type == "sap.m.Text" || control_type == "sap.m.Button" ){
				control_value = cell.getText();
			}else if( control_type == "sap.m.Input" ){
				control_value = cell.getValue();
			}else if( control_type == "sap.m.ComboBox" ){
				// for key value
				control_value = cell.getSelectedKey();
				// for key label value
				//control_value = control_type.getSelectedText();
			}else if( control_type == "sap.m.Switch" ){
				control_value = cell.getState();
			}else{
				control_value = cell.getValue();
			}
			
			return control_value;
		},		
		
		_getSelectedItemValues: function(){
			var selectedItem = this.byId( "studentsTable" ).getSelectedItem();
			var cells = selectedItem.getCells();
			// Customization required. If the field inside the cell is ComboBox, then we should use .getSelectedKey() for key value.
			//_activeRow.id = eval(this._getUIControlValue( cells[ cellIndexes.id ] ) );
			_activeRow.Name = this._getValueType( this._getUIControlValue( cells[cellIndexes.Name] ) );
			_activeRow.PhoneNo = this._getValueType( this._getUIControlValue( cells[cellIndexes.PhoneNo] ) );
			_activeRow.Email = this._getValueType( this._getUIControlValue( cells[cellIndexes.Email] ) );
			_activeRow.StudentId = this._getValueType( this._getUIControlValue( cells[cellIndexes.StudentId] ) );
			
			/* Below are retained for reference */
			// var CONTROL_CLASSNAME = cells[ cellIndexes.studentName ].getMetadata()._sClassName;
				//	Output--> "sap.m.Input"
				//	Output--> "sap.m.ComboBox"
			
			//_activeRow.date = new Date().getTime(); //this._getDateStringToday();
			//_activeRow.startTime = startTime + "";
			//_activeRow.student_id = eval( this.byId("selectedStudentId").getValue() ); //hidden field
			
			return _activeRow;
		},
					
		postJSON :  function(url, data, callback) {
		    return jQuery.ajax({
		        'type': 'POST',
		        'url': url,
		        'contentType': 'application/json',
		        'data': JSON.stringify(data),
		        'dataType': 'json',
		        'success': callback
		    });
		},
		
		fnFormatter: function(text, key) {
			var sText = "";

			if (text && key) {
				sText += (text + " (" + key + ")");
			} else if (text) {
				sText += text;
			} else if (key) {
				sText += key;
			}

			return sText;
		},

		/**
		 * Create a new entry.
		 */
		onCreate : function () {
			var oList = this.byId( "studentsTable" );
			var oBinding = oList.getBinding("items"),
				// Create a new entry through the table's list binding
				// You may need to change the column name in place of "description"
				oContext = oBinding.create({
						"Name" : null ,
						"PhoneNo" : null ,
						"Email" : null ,
								
				});
			this._setUIChanges(true);
			this.getView().getModel("appView").setProperty("/usernameEmpty", true);

			// Select and focus the table row that contains the newly created entry
			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		},

		/**
		 * Delete an entry.
		 */
		onDelete : function () {
			var oSelected = this.byId( "studentsTable" ).getSelectedItem();

			if (oSelected) {
				oSelected.getBindingContext().delete("$direct").then(function () {
					MessageToast.show(this._getText("deletionSuccessMessage"));
				}.bind(this), function (oError) {
					MessageBox.error(oError.message);
				});
			}
		},
		
		/**
		 * Copies tier_id value from placeholder column to actual column
		 */
		_copyToInputField: function( oCells, value ){
			for( var i=0; i < oCells.length; i++ ){
				if( oCells[i].getId().match( "tier_id_actual" ) ){
					oCells[i].setValue( value );
				}
			}
		},
		
		/**
		 * Selects the row of a table in which the user is making change of any field
		 */
		_selectRowOfChange: function(oEvt){
			// Select the row of input change
			var oFieldId = oEvt.getSource().getParent().getId();
			this.byId( "studentsTable" ).setSelectedItemById( oFieldId, true);
		},

		/**
		 * Lock UI when changing data in the input controls
		 * @param {sap.ui.base.Event} oEvt - Event data
		 */
		onInputChange : function (oEvt) {
			this._selectRowOfChange( oEvt );

			if (oEvt.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
				// Check if the id in the changed table row is empty and set the appView property accordingly
				if (oEvt.getSource().getParent().getBindingContext().getProperty("StudentId")) {
					this.getView().getModel("appView").setProperty("/usernameEmpty", false);
				}
			}
			
		},
		
		onInputChange_new : function (oEvt) {
			this._selectRowOfChange( oEvt );
			console.log("Using REST service for PATCH request");
			var odataServiceURL = "${backendServiceName}";
			var selectedItem = this.byId( "studentsTable" ).getSelectedItem();
			var cells = selectedItem.getCells();
			var itemId = cells[0].getValue();
			var name = cells[1].getValue();
			
			var tierId = cells[3].getValue();
			odataServiceURL = odataServiceURL + "Students(" + itemId + ")";
			/**
			 * FAIL: Two parameters is failing with 400 resp code; The request looks like this: name=test+26&Tier%40odata.bind=7
			 * FAIL: One parameter "Tier@odata.bind" fails with ?
			 * SUCCESS: One parameter "name" is working fine with 204 resp code; 
			 */
			/*
			var oParams = { 
								"name": name,
								"Tier@odata.bind" : tierId 
							};
			*/
			var oParams = { "name": name };
			
			$.ajax({
			    url : odataServiceURL,
			    data : oParams,
			    type : 'PATCH',
			    contentType : 'application/json',
			    xhr: function() {
			        return window.XMLHttpRequest == null || new window.XMLHttpRequest().addEventListener == null 
			            ? new window.ActiveXObject("Microsoft.XMLHTTP")
			            : $.ajaxSettings.xhr();
			    }
			});  

			
			//var oView = this.getView();
				//oView.getModel("appView").setBusy(true);
			/* 
			$.patch( odataServiceURL, oParams )
				.done(function(results){
					//oView.getModel("appView").setBusy(false);
					console.log("submitting...");
				})
				.fail(function(err){
					//oView.getModel("appView").setBusy(false);
					if( err !== undefined ){
						var errResp = $.parseJSON(err.responseText);
						MessageToast.show(errResp.message);
					}else{
						MessageToast.show("Unknown Error");
					}
				});
			*/
		},

		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId( "studentsTable" ).getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},

		/**
		 * Reset any unsaved changes.
		 */
		onResetChanges : function () {
			this.byId( "studentsTable" ).getBinding("items").resetChanges();
			this._bTechnicalErrors = false; // If there were technical errors, cancelling changes resets them.
			this._setUIChanges(false);
		},

		/**
		 * Reset the data source.
		 */
		onResetDataSource : function () {
			var oModel = this.getView().getModel(),
				oOperation = oModel.bindContext("/ResetDataSource(...)");

			oOperation.execute().then(function () {
					oModel.refresh();
					MessageToast.show(this._getText("sourceResetSuccessMessage"));
				}.bind(this), function (oError) {
					MessageBox.error(oError.message);
				}
			);
		},

		/**
		 * Save changes to the source.
		 */
		onSave : function () {
			var fnSuccess = function () {
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this._setUIChanges(false);
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges(false);
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // Lock UI until submitBatch is resolved.
			this.getView().getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
			this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
		},

		/**
		 * Search for the term in the search field.
		 */
		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("searchFieldStudents").getValue(),
				oFilter = new Filter("Name", FilterOperator.Contains, sValue);

			oView.byId( "studentsTable" ).getBinding("items").filter(oFilter, FilterType.Application);
		},

		/**
		 * Sort the table according to the Description.
		 * Cycles between the three sorting states "none", "ascending" and "descending"
		 */
		onSort_old : function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			// Cycle between the states
			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			// below column name "description" should be changed as per the requirement
			oView.byId( "studentsTable" ).getBinding("items").sort(sOrder && new Sorter("description", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
		},
		
		/*		
		onSort: function (oEvent) {
			var oTable = this.byId("studentsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();			
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},	*/
		
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("studentsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			/* if( sPath == "Student/name")
				sPath = "student_id";	*/
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},
		
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		
		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("com.devplatform.config.view.SortDialog_Student").open();
		},
		
		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},
		
		handleGroupButtonPressed: function () {
			this.createViewSettingsDialog("com.devplatform.config.view.GroupDialog_Student").open();
		},
		
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		
		handleGroupDialogConfirm: function (oEvent) {
			var oTable = this.byId("studentsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
		},


		onMessageBindingChange : function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this._setUIChanges(true);
			this._bTechnicalErrors = true;
			MessageBox.error(aMessages[0].message, {
				id : "serviceErrorMessageBox_Students",
				onClose : function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;
		},


		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */


		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @param {Array} [aArgs] - optional array of texts for placeholders.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText : function (sTextId, aArgs) {
			return this.getView().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},

		/**
		 * Set hasUIChanges flag in View Model
		 * @param {boolean} [bHasUIChanges] - set or clear hasUIChanges
		 * if bHasUIChanges is not set, the hasPendingChanges-function of the OdataV4 model determines the result
		 */
		_setUIChanges : function (bHasUIChanges) {
			if (this._bTechnicalErrors) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},

		/**
		 * Set busy flag in View Model
		 * @param {boolean} bIsBusy - set or clear busy
		 */
		_setBusy : function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		}
		
	});
});