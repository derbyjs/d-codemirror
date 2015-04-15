module.exports = CM;
function CM() {}
CM.prototype.view = __dirname;

CM.prototype.init = function() {
  var model = this.model;
  model.setNull("options", {});
  model.setNull("debounce", 150)
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

  var debounce;
  cm.on("change", function(cm, change) {
    if(that.supress) return;
    if(debounce) {
      clearTimeout(debounce);
      debounce = null;
    } 
    debounce = setTimeout(function(){
      var value = cm.getValue();
      that.model.pass({editing: true}).setDiff("text", value)
    }, model.get("debounce"))
  });
};

CM.prototype.check = function() {
  var that = this;
  setTimeout(function () {
    var cmText = that.cm.getValue();
    var otText = that.model.get("text") || '';
    var cursor = that.cm.getCursor();

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
      that.cm.setCursor(cursor)
    }
  }, 0);
};
