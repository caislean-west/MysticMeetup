/*
UnderMenu: Easy to use menu on the underside of the controller
caislean-west / 8-20-2018
*/

AFRAME.registerComponent('under-menu', {
	schema: {
		debug: { type: 'number', default: 1 }
	},
	attachMenuEntity: function() {
		var ent = document.createElement('a-entity');
		if (this.width == undefined) this.width = 0.1;
		if (this.height == undefined) this.height = 0.16;
		this.localPos = { x: 0, y: 0, z: -0.2 };
		ent.setAttribute('id', 'under-menu');
		ent.setAttribute('geometry', "primitive: plane;"
																 +"width: "+this.width+"; "
																 +"height: "+this.height+"; "); 
		ent.setAttribute('material', 'color: #333333');
		ent.setAttribute('position', this.localPos);
		ent.setAttribute('rotation', '90 180 0');
		this.el.appendChild(ent);
		return ent;
	},
	attachVisionBox: function() {
		var sideLen = 0.8;
		this.visionBox = { x: sideLen, y: sideLen, z: sideLen };
		var vb = this.visionBox;
		var ent = document.createElement('a-box');
		ent.setAttribute('primitive', 'box');
		ent.setAttribute('width', vb.x);
		ent.setAttribute('height', vb.y); 
		ent.setAttribute('depth', vb.z); 
		var pos = Object.assign({},this.localPos);
		pos.y -= (vb.y / 2);
		ent.setAttribute('position', pos);
		ent.setAttribute('material', 'color: blue; opacity: 0;');
		this.el.appendChild(ent);
		return ent;
	},
	attachDebugMessage: function() {
		var ent = document.createElement('a-text');
		var m = 0.01;
		var w = this.width-(2*m);
		var h = this.height-(2*m);
		ent.setAttribute('id', 'under-menu-text');
		ent.setAttribute('position','0 '+(h/2)+' 0.001');
		ent.setAttribute('width', w);
		ent.setAttribute('height', h);
		ent.setAttribute('align', 'left');
		ent.setAttribute('anchor', 'center');
		ent.setAttribute('baseline', 'top');
		ent.setAttribute('wrap-count', '16');
		if (this.menuEntity) {
			this.menuEntity.appendChild(ent);
		}
		return ent;
	},
	setDebugMessage: function(msg) {
		if (this.data.debug == 1) {
			this.debugEntity.setAttribute('value', msg);
		}
	},
	renderList: function() {
	},
	init: function() {
		this.menuEntity = this.attachMenuEntity();
		this.visionBoxEntity = this.attachVisionBox();
		if (this.data.debug == 1)
		{
			this.debugEntity = this.attachDebugMessage();
			this.setDebugMessage("The menu has been attached for testing");

			this.dispRot = function(self) {
				var rot = self.el.getAttribute('rotation');
				var rstr = ""+Math.trunc(rot.x)+"\n"+Math.trunc(rot.y)+"\n"+Math.trunc(rot.z)+"\n";
				self.setDebugMessage(rstr);
			};

			setInterval(this.dispRot, 1000, this);
		}

		// Tap variables
		this.singleTapDur = 1000;
		this.doubleTapDur = 200;
		this.singleTapActive = false;
		this.doubleTapActive = false;
		this.singleTapFn = null;
		this.doubleTapFn = null;
		this.tapCount = 0;

		var self = this;

		this.el.addEventListener('trackpadtouchstart', function() {
			if (self.singleTapFn != null) {
				clearTimeout(self.singleTapFn);
				self.singleTapFn = null;
			}
			self.singleTapActive = true;
			self.singleTapFn = setTimeout(function() {
				self.singleTapActive = false;
			}, self.singleTapDur);
		});
		
		this.el.addEventListener('trackpadtouchend', function() {
			if (self.singleTapActive) {
				self.tapCount++;
				self.el.emit('trackpad-tap', {count: self.tapCount}, true);
			}
			if (self.doubleTapFn != null) {
				clearTimeout(self.doubleTapFn);
				self.doubleTapFn = null;
			}
			self.doubleTapActive = true;
			self.doubleTapFn = setTimeout(function() {
				self.doubleTapActive = false;
				self.tapCount = 0;
			}, self.doubleTapDur);
		});

		// Log number of taps for reference
		if (debug != 0) {
			this.el.addEventListener('trackpad-tap', function (event) {
				var n = event.detail.count;
				console.log('TAP: '+n);
			});
		}

		// Double-tap and check if in visionbox
		this.el.addEventListener('trackpad-tap', function (event) {
			var n = event.detail.count;
			console.log('TAP: '+n);
		});
	}
});
