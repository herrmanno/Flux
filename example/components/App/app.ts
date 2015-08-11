/// <reference path="../bower_components/ho-components/dist/d.ts/components.d.ts"/>

class App extends ho.components.Component {

	requires = ['Navbar', 'View']

	html = '<navbar/><br/><view viewname="view1"/>'
}
