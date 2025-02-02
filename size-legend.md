There is a new "subclass" of DataConfiguration which supports asking for a size for a case using getLegendColorForCase.

Currently this is handled by adding a new "type" for the attribute description in the dataconfiguration of "cateogricalSize". However this approach doesn't work to well since the user might want to switch the type from categorical to numeric. They shouldn't have to choose between:
categoricalSize, categoricalColor, numericSize, numericColor, dateSize, dataColor

Instead the attribute description should have a property like "representation" in addition to "type". This way the representation can remain color or size and the user can just change the type of the data in the attribute.
