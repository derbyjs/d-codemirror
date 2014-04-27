d-barchart
==================

Example CodeMirror Derby component.  

# Usage
[Example usage](http://github.com/codeparty/derby-examples/tree/master/codemirror)

## In your template
```
<Head:>
  <view name="d-codemirror:includes"></view>
<Body:>
  <view name="d-codemirror" text={{_page.text}} options="{{ { tabSize: 2 } }}"></view>
```

## Your data
```
model.set("_page.text", "Hello World");
```
See the [derby-examples](http://github.com/codeparty/derby-examples/tree/master/codemirror)
repo for an example using real-time data subscriptions to power multi-player editing.
