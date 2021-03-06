/**
 *
 * Created by sdiemert on 15-07-10.
 */

define(function (require, exports, module) {
    var Commands            = app.getModule('command/Commands');
    var CommandManager      = app.getModule("command/CommandManager");
    var MenuManager         = app.getModule("menu/MenuManager");
    var ElementPickerDialog = app.getModule("dialogs/ElementPickerDialog");
    var FileSystem          = app.getModule("filesystem/FileSystem");
    var Dialogs             = app.getModule("dialogs/Dialogs");

    var JSGen               = require("JSCodeGenerator");
    var JavaScriptConfigure = require("JavaScriptConfigure");

    function selectFolder(result, base, path, opts) {

        // If path is not assigned, popup Open Dialog to select a folder
        if (!path) {

            FileSystem.showOpenDialog(false, true, "Select a folder where generated codes to be located", null, null,
                function (err, files) {
                    if (!err) {
                        if (files.length > 0) {
                            path = files[0];
                            JSGen.generate(base, path, opts).then(result.resolve, result.reject);
                        } else {
                            result.reject(FileSystem.USER_CANCELED);
                        }
                    } else {
                        result.reject(err);
                    }
                }
            );

        } else {

            JSGen.generate(base, path, opts).then(result.resolve, result.reject);

        }

    }


    function handleGenerate(base, path, opts) {

        var result = new $.Deferred();

        opts = JavaScriptConfigure.getGenOptions();

        console.log(opts);

        // If base is not assigned, popup ElementPicker
        if (!base) {
            ElementPickerDialog.showDialog("Select a base model to generate codes", null, type.UMLPackage)
                .done(function (buttonId, selected) {
                    if (buttonId === Dialogs.DIALOG_BTN_OK && selected) {
                        base = selected;

                        selectFolder(result, base, path, opts);

                    } else {
                        result.reject();
                    }
                });
        } else {

            selectFolder(result, base, path, opts);

        }

        return result.promise();

    }

    function _handleConfigure() {
        CommandManager.execute(Commands.FILE_PREFERENCES, JavaScriptConfigure.getId());
    }

    var OUTER_CMD    = "javascript";
    var CMD_GENERATE = "javascript.generate";
    var CMD_CONFIG   = "javascript.configure";

    CommandManager.register("JavaScript", OUTER_CMD, CommandManager.doNothing);
    CommandManager.register("Generate...", CMD_GENERATE, handleGenerate);
    CommandManager.register("Configure...", CMD_CONFIG, _handleConfigure);

    var menu, jsMenu;

    menu   = MenuManager.getMenu(Commands.TOOLS);
    jsMenu = menu.addMenuItem(OUTER_CMD);

    jsMenu.addMenuItem(CMD_GENERATE);
    jsMenu.addMenuDivider();
    jsMenu.addMenuItem(CMD_CONFIG);

});

