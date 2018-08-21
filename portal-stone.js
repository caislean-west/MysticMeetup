/*
PortalStone: Simple teleportation between two objects.
caislean-west / 8-2018
*/

AFRAME.registerComponent('portal-traveller', {
		schema: { type: 'number', default: 1 },
		init: function() {
				var hit = document.querySelector("a-entity[teleport-controls]");
				var self = this;
				this.el.sceneEl.addEventListener('portal-announce', function(event) {
								if (event.detail.travdata == self.data) {
									var p = event.detail.pos;
									var pstr = ""+p.x+" "+p.y+" "+p.z;
									console.log("Traveller #"+self.data+" moving to: "+pstr);
									self.el.setAttribute("position", p);
									hit.setAttribute("teleport-controls", "hitYRegister: "+p.y);
								}
				});
		}
});

AFRAME.registerComponent('portal-stone', {
		schema: { type: 'string' },
		init: function() {
			var elem = document.createElement('a-animation');
			elem.setAttribute("attribute", "material.emissive"); 
			elem.setAttribute("from", "#000000"); 
			elem.setAttribute("to", "#132d2d"); 
			elem.setAttribute("dur", "700"); 
			elem.setAttribute("direction", "alternate"); 
			elem.setAttribute("repeat", "indefinite");
			elem.setAttribute("begin", "mouseenter"); 
			elem.setAttribute("end", "mouseleave");
			this.el.appendChild(elem);

			var self = this;
      this.el.addEventListener('mouseleave', function () {
				var targetid = self.data;
				var p = document.querySelector("#"+targetid).getAttribute("position");
				var pstr = ""+p.x+" "+p.y+" "+p.z;
				console.log("Portal to "+targetid+" is announcing "+pstr);
				self.el.emit('portal-announce', { travdata: 1, pos: p }, true);
      });
		}
});

AFRAME.registerComponent('portal-speaker', {
		schema: { type: 'string', default: "Speaker" },
		init: function() {
				console.log(""+this.data+" was born.");
				var self = this;
				this.el.sceneEl.addEventListener('portal-announce', function(event) {
						console.log(""+self.data+" heard event: "+event.details.toString());
				});
		}
});

AFRAME.registerComponent('teleport-log', {
		init: function() {
				var self = this;
				this.el.addEventListener('teleported', function(event) {
						var d = event.detail;
						from = d.oldPosition.toArray().toString();
						to = d.newPosition.toArray().toString();
						hit = d.hitPoint.toArray().toString();
						console.log("Teleported: "+from+" -> "+to+", Hitpoint: "+hit);
				});
		}
});

