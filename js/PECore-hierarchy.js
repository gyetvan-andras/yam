
PECore.prototype.loadHierarchyTree = function() {
	'use strict';
	this.objectLayer.node_name = 'Background';
	var rootNode = this.createNodeFromDisplayObject(this.objectLayer);
	rootNode.isRoot = true;
	// var data = [rootNode];
	$('#hierarchyTree').tree('loadData', [rootNode]);
};

PECore.prototype.createNodeFromDisplayObject = function(o) {
	'use strict';
	if(o.node_id === undefined) {
		o.node_id = this.nextObjectId;
		this.nextObjectId++;
	}
	if(o.node_name === undefined) {
		o.node_name = 'Sticker-'+o.node_id;
	}
	var node = {label:o.node_name, id:o.node_id, displayObject:o, isRoot:false};
	o.treeNode = node;
	node.children = [];
	for(var idx = 0; idx < o.children.length;idx++) {
		var child = this.createNodeFromDisplayObject(o.children[idx]);
		node.children.push(child);
	}
	return node;
};

PECore.prototype.displayObjectRenamed = function(object) {
	'use strict';
	var node = $('#hierarchyTree').tree('getNodeById',object.treeNode.id);
	object.treeNode.label = object.node_name;
	$('#hierarchyTree').tree('updateNode', node, object.node_name);
};

PECore.prototype.addChildNodeTo = function(parent,child) {
	'use strict';
	var parentNode = $('#hierarchyTree').tree('getNodeById',parent.treeNode.id);
	var childNode = this.createNodeFromDisplayObject(child);
	$('#hierarchyTree').tree('appendNode',childNode,parentNode);
	
};

PECore.prototype.deleteTreeNode = function(displayObject) {
	'use strict';
	var node;
	if(displayObject) {
		node = $('#hierarchyTree').tree('getNodeById',displayObject.treeNode.id);
		$('#hierarchyTree').tree('removeNode', node);
	}
};

PECore.prototype.selectTreeNode = function(displayObject) {
	'use strict';
	var node;
	if(displayObject && displayObject.treeNode && displayObject.treeNode.id) {
		// if(displayObject.treeNode && displayObject.treeNode.id)
		node = $('#hierarchyTree').tree('getNodeById',displayObject.treeNode.id);
	} else {
		node = $('#hierarchyTree').tree('getNodeById',this.objectLayer.treeNode.id);
	}
	$('#hierarchyTree').tree('selectNode', node);
	$('#hierarchyTree').tree('scrollToNode', node);
};

PECore.prototype.fixDisplayObjectPosition = function(child, oldParent,newParent) {
	'use strict';
	// var pos = oldParent.toGlobal(child.position);
	var newPos = newParent.toLocal(child.position,oldParent);
	child.position.x = newPos.x;
	child.position.y = newPos.y;
};

PECore.prototype.bringToFrontDisplayObject = function(child) {
	'use strict';
	var currentParent = child.parent;
	var last_idx = currentParent.children.length - 1;
	var last_child = currentParent.children[last_idx];
	if(last_child == child) return;
	currentParent.setChildIndex(child,last_idx);
	var target_node = this.hierarchyTree.tree('getNodeById', last_child.node_id);
	var node = this.hierarchyTree.tree('getNodeById', child.node_id);
	this.hierarchyTree.tree('moveNode', node, target_node, 'after');
	this.manualRefresh();
	this.selectDisplayObject(child);
	this.selectTreeNode(child);
	this.manualRefresh();
};

PECore.prototype.sendToBackDisplayObject = function(child) {
	var currentParent = child.parent;
	var first_child = currentParent.children[0];
	if(first_child == child) return;
	currentParent.setChildIndex(child,0);
	var target_node = this.hierarchyTree.tree('getNodeById', first_child.node_id);
	var node = this.hierarchyTree.tree('getNodeById', child.node_id);
	this.hierarchyTree.tree('moveNode', node, target_node, 'before');
	this.manualRefresh();
	this.selectDisplayObject(child);
	this.selectTreeNode(child);
	this.manualRefresh();
};

PECore.prototype.moveDisplayObject = function(child,target,index) {
	'use strict';
	if(target == this.objectLayer && index == 'after') return false;

	var currentParent = child.parent;
	var idx;
	switch(index) {
		case 'after':
			var newParent = target.parent;
			if(currentParent == newParent) {
				idx = currentParent.getChildIndex(target);
				currentParent.setChildIndex(child,idx);
			} else {
				currentParent.removeChild(child);
				idx = newParent.getChildIndex(target) + 1;
				if(idx >= newParent.children.length) {
					newParent.addChild(child);
				} else {
					newParent.addChildAt(child,idx);
				}
				this.fixDisplayObjectPosition(child,currentParent,newParent);
			}
		break;
		case 'before':
		break;
		case 'inside':
			if(currentParent == target) {
				currentParent.setChildIndex(child,0);
			} else {
				currentParent.removeChild(child);
				target.addChildAt(child,0);
				this.fixDisplayObjectPosition(child,currentParent,target);
			}
		break;
	}
	this.manualRefresh();
	this.selectDisplayObject(child);
	this.selectTreeNode(child);
	this.manualRefresh();
	return true;
};

PECore.prototype.createHierarchyTree = function() {
	'use strict';
	this.hierarchyTree = $('#hierarchyTree').tree({
		dragAndDrop: true,
		// data:data,
		keyboardSupport: false,
		autoOpen: 0
	});	

	var self = this;	
	this.hierarchyTree.bind(
	    'tree.select',
	    function(event) {
	        if (event.node) {
	        		self.selectDisplayObject(event.node.displayObject);
					if(event.node.displayObject != self.objectLayer) {
						self.app.isTargetSelected = true;
					} else {
						self.app.isTargetSelected = false;
					}
	        		if(event.node.displayObject.locked) {
						self.selectionHandler.assignTo(undefined);
						self.activeTarget = undefined;
						self.manualRefresh();
	        		}
	        }
	        else {
	        	self.selectDisplayObject(undefined);
	        }
	    }
	);
	this.hierarchyTree.bind(
	    'tree.move',
	    function(event) {
	    	if(!self.moveDisplayObject(event.move_info.moved_node.displayObject,event.move_info.target_node.displayObject,event.move_info.position)) {
	    		event.preventDefault();
	    	}
	        // console.log('moved_node', event.move_info.moved_node);
	        // console.log('target_node', event.move_info.target_node);
	        // console.log('position', event.move_info.position);
	        // console.log('previous_parent', event.move_info.previous_parent);
	    }
	);
};
