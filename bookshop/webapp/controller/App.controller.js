sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
], function (Controller, MessageToast, Dialog, Button, Text, Filter, FilterOperator, formatter) {
    // content of the function stays here
    "use strict"
    return Controller.extend("sap.codejam.controller.App", {
        formatter: formatter,
        onSelect: function (oEvent) {
            const oSource = oEvent.getSource()
            const contextPath = oSource.getBindingContextPath()
            const form = this.getView().byId("bookDetails")
            form.bindElement(contextPath)
        },
        onSubmitOrder: function (oEvent) {
            const oBindingContext = this.getView().byId("bookDetails").getBindingContext()
            const selectedBookID = oBindingContext.getProperty("ID")
            const selectedBookTitle = oBindingContext.getProperty("title")
            const inputValue = this.getView().byId("stepInput").getValue()

            const i18nModel = this.getView().getModel("i18n")
            const oModel = this.getView().getModel()
            oModel.callFunction("/submitOrder", {
                method: "POST",
                urlParameters: {
                    "book": selectedBookID,
                    "quantity": inputValue
                },
                success: function(oData, oResponse) {
                    oModel.refresh()
                    const oText = `${i18nModel.getProperty("orderSuccessful")} (${selectedBookTitle}, ${inputValue} ${i18nModel.getProperty("pieces")})`
                    MessageToast.show(oText)
                },
                error: function(oError) {
                    if (oError.responseText) {
                        oError = JSON.parse(oError.responseText).error
                    }
                    this.oErrorMessageDialog = new Dialog({
                        type: "Standard",
                        title: i18nModel.getProperty("Error"),
                        state: "Error",
                        content: new Text({ text: oError.message })
                            .addStyleClass("sapUiTinyMargin"),
                        beginButton: new Button({
                            text: i18nModel.getProperty("Close"),
                            press: function () {
                                this.oErrorMessageDialog.close()
                            }.bind(this)
                        })
                    })
                    this.oErrorMessageDialog.open()
                }.bind(this)
            })
        },
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue")
            const aFilter = []
            if (sQuery) {
                aFilter.push(new Filter("title", FilterOperator.Contains, sQuery))
            }
            const oList = this.byId("booksTable")
            const oBinding = oList.getBinding("items")
            oBinding.filter(aFilter)
        },
        onAfterRendering: function () {
            this.getView().byId("orderBtn").setEnabled(false)
        }
    })
})