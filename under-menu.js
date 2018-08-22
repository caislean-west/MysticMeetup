/*
UnderMenu: Easy to use menu on the underside of the controller
caislean-west / 8-20-2018
*/

AFRAME.registerComponent('under-menu', {
	schema: {
		debug: { type: 'number', default: 1 }
	},
	applyMenuFading: function(ent, isText=false) {
		var dur = 500;

		var oalpha = document.createElement('a-animation'); 
		if (isText) {
			console.log(ent.getAttribute('visible'));
			oalpha.setAttribute('attribute', 'visible');
			oalpha.setAttribute('from', false); 
			oalpha.setAttribute('to', true); 
		} else {
			oalpha.setAttribute('attribute', 'material.opacity');
			oalpha.setAttribute('from', '0'); 
			oalpha.setAttribute('to', '1'); 
		}
		oalpha.setAttribute('dur', dur); 
		oalpha.setAttribute('begin', 'under-menu-open'); 
		ent.appendChild(oalpha);

		var calpha = document.createElement('a-animation'); 
		if (isText) {
			calpha.setAttribute('attribute', 'visible');
			calpha.setAttribute('from', true); 
			calpha.setAttribute('to', false); 
			calpha.setAttribute('dur', 1); 
		} else {
			calpha.setAttribute('attribute', 'material.opacity');
			calpha.setAttribute('from', '1'); 
			calpha.setAttribute('to', '0'); 
			calpha.setAttribute('dur', dur); 
		}
		calpha.setAttribute('begin', 'under-menu-close'); 
		ent.appendChild(calpha);
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
		ent.setAttribute('material', 'color: #333333; opacity: 1;');
		ent.setAttribute('position', this.localPos);
		ent.setAttribute('rotation', '90 180 0');
		
		this.el.appendChild(ent);
		this.applyMenuFading(ent);

		return ent;
	},
	attachVisionBox: function() {
		var sideLen = 0.8;
		this.visionRadius = sideLen/2;
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
		ent.setAttribute('material', 'color: blue; opacity: 0.1;');
		ent.setAttribute('visible', false);
		this.el.appendChild(ent);
		return ent;
	},
	checkVisionBox: function() {
		var hpos = new THREE.Vector3();
		hpos.setFromMatrixPosition(this.headElem.object3D.matrixWorld);
		var vpos = new THREE.Vector3();
		vpos.setFromMatrixPosition(this.visionBoxEntity.object3D.matrixWorld);
		var diffLenSq = hpos.sub(vpos).lengthSq();
		var visionSq = this.visionRadius * this.visionRadius;

		if (diffLenSq < visionSq) {
			return true;
		} else {
			return false;
		}
	},

	attachDebugMessage: function() {
		//var ent = document.createElement('a-text');
		var ent = document.createElement('a-entity');
		var m = 0.01;
		var w = this.width-(2*m);
		var h = this.height-(2*m);
		ent.setAttribute('id', 'under-menu-text');
		ent.setAttribute('position', '0 '+(h/2)+' 0.001');
		
		var text = {};
		text['width'] = w;
		text['height'] = h;
		text['align'] = 'left';
		text['anchor'] = 'center';
		text['baseline'] = 'top';
		text['wrapCount'] = '16';

		console.log(text);
		ent.setAttribute('text', text);
		/*
		ent.setAttribute('id', 'under-menu-text');
		ent.setAttribute('position','0 '+(h/2)+' 0.001');
		ent.setAttribute('width', w);
		ent.setAttribute('height', h);
		ent.setAttribute('align', 'left');
		ent.setAttribute('anchor', 'center');
		ent.setAttribute('baseline', 'top');
		ent.setAttribute('wrap-count', '16');
		*/
		if (this.menuEntity) {
			this.menuEntity.appendChild(ent);
		}
		return ent;
	},
	setDebugMessage: function(msg) {
		this.debugMessage = msg;
		this.render();
	},
	setTopMessage: function(msg) {
		this.topMessage = msg;
		this.render();
	},

	// TODO: get rid of self reference, check if necessary?
	openMenu: function(self) {
		if (!self.menuActive) {
			self.menuEntity.emit('under-menu-open', { state: 1 }, true);
			self.menuActive = true;
			if (self.openSound) self.openSound.components.sound.playSound();
			if (self.debugEntity) self.debugEntity.setAttribute('visible', true);
		}
	},
	closeMenu: function(self, silent=false) {
		if (self.menuActive) { 
			self.menuEntity.emit('under-menu-close', { state: 1 }, true);
			self.menuActive = false;
			if (self.closeSound && !silent) self.closeSound.components.sound.playSound();
			if (self.debugEntity) self.debugEntity.setAttribute('visible', false);
		}
	},
	cardinalMove: function(dir) {
		if (dir == 'right') {
			this.setTopMessage("Swipe [>>]");
		} else if (dir == 'left') {
			this.setTopMessage("Swipe [<<]");
		} else if (dir == 'up') {
			this.setTopMessage("Swipe [/\\]");
		} else if (dir == 'down') {
			this.setTopMessage("Swipe [\\/]");
		} 
	},
	render: function() {
		var msg = this.topMessage
							+"\n---\n"
							+this.debugMessage;
		if (this.data.debug == 1) {
			this.debugEntity.setAttribute('text', 'value: '+msg);
		}
	},
	renderList: function () {
	},

	init: function() {
		this.menuActive = false;
		this.menuLevel = 0;

		// Text lines
		this.topMessage = "";
		this.debugMessage = "";

		// Menu sounds
		this.openSound = this.el.querySelector("#under-menu-open-sound");
		this.closeSound = this.el.querySelector("#under-menu-close-sound");

		// Vision box elements
		this.headElem = document.querySelector("a-entity[camera]");
		this.menuEntity = this.attachMenuEntity();
		this.visionRadius = 1;
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

		// Swipe variables
		this.deadzone = 0.2;
		this.touchStart = null;
		this.touchEnd = null;
		this.sampleDelay = 40;
		this.sampleCount = 0;

		// Tap variables
		this.singleTapDur = 1000;
		this.doubleTapDur = 200;
		this.singleTapActive = false;
		this.doubleTapActive = false;
		this.singleTapFn = null;
		this.doubleTapFn = null;
		this.tapCount = 0;

		var self = this;

		this.el.addEventListener('trackpadtouchstart', function(event) {
			if (self.singleTapFn != null) {
				clearTimeout(self.singleTapFn);
				self.singleTapFn = null;
			}
			self.singleTapActive = true;

			if (self.axisFn != null) {
				self.el.removeEventListener('axismove', self.axisFn);
				console.log("AXISMOVE Removed");
				self.axisFn = null;
			}
			// Get axis value at start
			self.axisFn = self.el.addEventListener('axismove', function(event) {
				self.sampleCount++;
				if (self.sampleCount > self.sampleDelay) {
					console.log(event.detail.axis);
					self.touchStart = Object.assign({}, self.touchEnd);
					self.touchEnd = Object.assign({}, event.detail.axis);
					self.sampleCount = 0;
				}
			});
			console.log("AXISMOVE Added");

			self.singleTapFn = setTimeout(function() {
				self.singleTapActive = false;
			}, self.singleTapDur);
		});
		
		this.el.addEventListener('trackpadtouchend', function() {
			self.el.removeEventListener('axismove', self.axisFn);
			console.log("AXISMOVE Removed");

			if (self.singleTapActive) {
				self.tapCount++;
				self.el.emit('trackpad-tap', {count: self.tapCount}, true);
				
				// Check direction and generate event
				if (self.touchStart != null && self.touchEnd != null) {
					var v1 = self.touchStart;
					var v2 = self.touchEnd;
					var touchVec = { x: (v2[0]-v1[0]), y: (v2[1]-v1[1]) };
					
					self.el.emit('trackpad-swipe', {vector: touchVec}, true);

					self.touchStart = null;
					self.touchEnd = null;
				}
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
		if (this.debug != 0) {
			this.el.addEventListener('trackpad-tap', function (event) {
				var n = event.detail.count;
				console.log('TAP: '+n);
			});
		}

		// Double-tap and check if in visionbox
		this.el.addEventListener('trackpad-tap', function (event) {
			var n = event.detail.count;
			if (self.checkVisionBox()) {
				if (n == 2)
				{
					if (self.menuActive) {
						if (self.menuLevel <= 0) self.closeMenu(self);
					} else {
						self.openMenu(self);
					}
				}
			}
		});

		// Generate cardinal swipe
		this.el.addEventListener('trackpad-swipe', function (event) {
			var v = event.detail.vector;
			var d = self.deadzone;
			
			if (v.x > d && -d < v.y && v.y < d) {
				self.el.emit('trackpad-swipe-cardinal', { dir: 'right'}, true);
			} else if (v.x < -d && -d < v.y && v.y < d) {
				self.el.emit('trackpad-swipe-cardinal', { dir: 'left'}, true);
			} else if (v.y > d && -d < v.x && v.x < d) {
				self.el.emit('trackpad-swipe-cardinal', { dir: 'up'}, true);
			} else if (v.y < -d && -d < v.x && v.x < d) {
				self.el.emit('trackpad-swipe-cardinal', { dir: 'down'}, true);
			}
		});

		// Navigate menu
		this.el.addEventListener('trackpad-swipe-cardinal', function (event) {
			var dir = event.detail.dir;

			self.cardinalMove(dir);
		});

		this.el.sceneEl.addEventListener('under-menu-open', function (event) {
			self.setDebugMessage("MENU OPEN");
		});
		this.el.sceneEl.addEventListener('under-menu-close', function (event) {
			self.setDebugMessage("MENU CLOSE");
		});

		this.el.emit('under-menu-close');
	}
});
