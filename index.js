module.exports = CM;
function CM() {}
CM.prototype.view = __dirname;

CM.prototype.init = function() {
  var model = this.model;
  model.setNull("options", {});
};

CM.prototype.create = function() {
  var model = this.model;
  var that = this;

  var options = this.getAttribute("options");
  var cm = this.cm = CodeMirror.fromTextArea(this.textarea, options);

  // Dynamically load necessary files for the CodeMirror mode set through the mode option
  // Mode can either be a mime-type `text/html` or a CodeMirror mode-name `htmlmixed`
  // cf. http://codemirror.net/demo/loadmode.html

  if (options.mode) {
    var mode = options.mode;
    if (/\//.test(options.mode)) {
      var info = CodeMirror.findModeByMIME(options.mode);
      if (info) {
        mode = info.mode;
      }
    }
    CodeMirror.autoLoadMode(cm, mode);
  }

  // changes in values inside the array
  model.on("change", "text", function(oldVal, newVal, passed) {
    //console.log("change data:", arguments);
    //we don't want to change the CM instance if we did the change
    if(passed.editing) return;
    var stringInsert = passed.$stringInsert;
    var stringRemove = passed.$stringRemove;
    if(stringInsert && stringInsert.text) {
      that.supress = true;
      cm.replaceRange(stringInsert.text, cm.posFromIndex(stringInsert.index));
      that.supress = false;
      that.check();
    } else if(stringRemove && stringRemove.howMany) {
      that.supress = true;
      var from = cm.posFromIndex(stringRemove.index);
      var to = cm.posFromIndex(stringRemove.howMany);
      cm.replaceRange('', from, to);
      that.supress = false;
      that.check();
    }
  });

  cm.on("change", function(cm, change) {
    if(that.supress) return;
    //console.log("change", change)
    var start = cm.indexFromPos(change.from);
    var condition;

    //see if we have anything to insert
    condition = typeof(change.text) === "string" && change.text
    if(change.text.length >= 1 || condition ) {
      //if(change.text.length == 1 && !change.text[0]) return; //don't insert nothing
      var toInsert = change.text.join("\n");
      model.pass({editing: true }).stringInsert("text", start, toInsert);
    }

    //delete anything if needed
    condition = typeof(change.removed) === "string" && change.removed
    if(change.removed.length >= 1 || (typeof(change.removed === "string") && change.removed)) {
      var toRemove = change.removed.join("\n");
      //console.log("toremove", toRemove, start)
      model.pass({editing: true }).stringRemove("text", start, toRemove.length);
    }
    
    that.check();
  });
};

CM.prototype.check = function() {
  var that = this;
  setTimeout(function () {
    var cmText = that.cm.getValue();
    var otText = that.model.get("text") || '';

    if (cmText != otText) {
      /*
      console.error("Text does not match!");
      console.error("cm: " + cmText);
      console.error("ot: " + otText);
      */
      // Replace the editor text with the current model value.
      that.supress = true;
      that.cm.setValue(otText);
      that.supress = false;
    }
  }, 0);
};
