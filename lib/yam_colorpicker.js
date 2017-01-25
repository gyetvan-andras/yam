jQuery.fn.yamcolors = function (target) {
  $.yamcolors(this, target, null);
  return this;
};

jQuery.fn.yamcolors_wo = function (target,opts) {
  $.yamcolors(this, target, opts);
  return this;
};

jQuery.yamcolors = function (containers, target, opts) {
  var container = $(containers).get(0);
  return container.yamcolors || (container.yamcolors = new jQuery._yamcolors(container, target, opts));
};

jQuery._yamcolors = function (container, target, opts) {
  var pxc = this;
  var template = [
    '<div class="cp-wrapper">',
    '  <div class="cp-tabs">',
    '    <div class="cp-tab-palette cp-tab">Palettes</div>',
    '    <div class="cp-tab-colorwheel cp-tab cp-active">Color Wheel</div>',
    '  </div>',
    '  <div class="cp-pan-palette cp-panel">',
    '    <span class="custom-dropdown custom-dropdown--small custom-dropdown--red">',
    '        <select class="cp-dropdown custom-dropdown__select custom-dropdown__select--red">',
    '        </select>',
    '    </span>',
    '    <div class="cp-palette-content">',
    '      <ul class="cp-palette-items">',
    '      </ul>',
    '    </div>',
    '  </div>',
    '  <div class="cp-pan-colorwheel cp-panel cp-active">',
    '    <div class="cp-fb"></div>',
    '    <div class="cp-row">',
    '      <span class="cp-label">R:</span><input type="range" class="yam-range cp-r cp-range" value="0" min="0" max="255">',
    '      <input type="text" class="cp-r-n cp-range" value="0">',
    '    </div>',
    '    <div class="cp-row">',
    '      <span class="cp-label">G:</span><input type="range" class="yam-range cp-g cp-range" value="0" min="0" max="255">',
    '      <input type="text" class="cp-g-n cp-range" value="0">',
    '    </div>',
    '    <div class="cp-row">',
    '      <span class="cp-label">B:</span><input type="range" class="yam-range cp-b cp-range" value="0" min="0" max="255">',
    '      <input type="text" class="cp-b-n cp-range" value="0">',
    '    </div>',
    '  </div>',
    '  <div class="cp-footer">',
    '    <div class="cp-footer-button cp-remove">Remove</div>',
    // '   <div class="cp-footer-button" style="background:#008080">Done</div>',
    '  </div>',
    '</div>',
  ];
  $(container).html(template.join(''));
  var e = $('.yamcolors', container);
  var fbe = $('.cp-fb', container).get(0);

  pxc.target = target;
  if(opts) {
    pxc.cbColorChanged = opts.cbColorChanged;
    pxc.cbRemove = opts.cbRemove;
    if(opts.showRemove) {
      $(".cp-footer",container).css("display","table");
    } else {
      $(".cp-footer",container).css("display","none");
    }
  } else {
      $(".cp-footer",container).css("display","none");
  }
  $(".cp-remove",container).click(function() {
    pxc.hide();
    pxc.cbRemove();
  });
  $(".cp-r",container).on("input change", updateFromSliders);
  $(".cp-g",container).on("input change", updateFromSliders);
  $(".cp-b",container).on("input change", updateFromSliders);

  $(".cp-r-n",container).on("input change", updateFromRGBInputs);
  $(".cp-g-n",container).on("input change", updateFromRGBInputs);
  $(".cp-b-n",container).on("input change", updateFromRGBInputs);

  pxc.fb = $.farbtastic(fbe,function(color) {
    var rgb = pxc.fb.unpack(color);
    var hsl = pxc.fb.RGBToHSL(rgb);

    $('.cp-r',container).val(rgb[0]*255);
    $('.cp-g',container).val(rgb[1]*255);
    $('.cp-b',container).val(rgb[2]*255);
    $('.cp-r-n',container).val(rgb[0]*255);
    $('.cp-g-n',container).val(rgb[1]*255);
    $('.cp-b-n',container).val(rgb[2]*255);
    $(pxc.target).css({
      backgroundColor: color,
      color: hsl[2] > 0.5 ? '#000' : '#fff'
    });
    $(pxc.target).val(color);
    if(pxc.cbColorChanged) pxc.cbColorChanged(color);
  });


  function updateFromTarget() {
    if ($(pxc.target).val()) {
      pxc.fb.setColor($(pxc.target).val());
    }
  }
  $(pxc.target).bind('keyup', updateFromTarget);
  // $(pxc.target).bind('input', updateFromTarget);
  // $(pxc.target).change(function() {
  //   console.log("On CHANGE");
  //   updateFromTarget();
  // });
  updateFromTarget();

  function updateFromSliders() {
    var r = $(".cp-r",container).val()/255;
    var g = $(".cp-g",container).val()/255;
    var b = $(".cp-b",container).val()/255;
    var rgb = pxc.fb.pack([r,g,b]);
    pxc.fb.setColor(rgb);
  }

  function updateFromRGBInputs() {
    var r = $(".cp-r-n",container).val()/255;
    var g = $(".cp-g-n",container).val()/255;
    var b = $(".cp-b-n",container).val()/255;
    var rgb = pxc.fb.pack([r,g,b]);
    pxc.fb.setColor(rgb);
  }

  pxc.wrapper = $(".cp-wrapper",container);

  pxc.wrapper.css("visibility","hidden");

  $(target).click(function() {
    var vis = pxc.wrapper.css("visibility");
    if(vis == "visible") {
      pxc.hide();
    } else {
      pxc.show();
    }
  });

  $(".cp-tab-palette",container).click(function() {
    $(".cp-tab-palette",container).addClass("cp-active");
    $(".cp-tab-colorwheel",container).removeClass("cp-active");
    $(".cp-pan-palette",container).addClass("cp-active");
    $(".cp-pan-colorwheel",container).removeClass("cp-active");
  });

  $(".cp-tab-colorwheel",container).click(function() {
    $(".cp-tab-palette",container).removeClass("cp-active");
    $(".cp-tab-colorwheel",container).addClass("cp-active");
    $(".cp-pan-palette",container).removeClass("cp-active");
    $(".cp-pan-colorwheel",container).addClass("cp-active");
  });
  var palette_dropdown =  $(".cp-dropdown",container);
  var palette_items =  $(".cp-palette-items",container);

  function reloadColors(p_idx) {
    palette_items.empty();
    var palette = yam_colorpicker_palettes[p_idx];
    $.each(palette.items,function(idx, color) {
      var clr = color.color;
      var $li = $('<li class="cp-palette-item">');
      var $color = $('<span class="cp-palette-item-color" style="background:'+clr+';">');
      var $label = $('<span class="cp-palette-item-label">').text(color.name);
      $li.append($color);
      $li.append($label);
      $li.click(function() {
        pxc.selectColor(clr);
      });
      palette_items.append($li);
    });
  }

  $.each(yam_colorpicker_palettes,function(idx, palette) {
    var $opt = $('<option value="'+idx+'">').text(palette.name);
    palette_dropdown.append($opt);
  });
  reloadColors(0);

  palette_dropdown.change(function() {
    var idx = palette_dropdown.val();
    reloadColors(idx);
  });

  pxc.onClick = function() {
    var vis = pxc.wrapper.css("visibility");
    if(vis == "visible") {
      pxc.hide();
    } else {
      pxc.show();
    }
  };

  pxc.selectColor = function(color) {
    pxc.fb.setColor(color);
  };

  pxc.show = function() {
    if(document.activePXC) {
      document.activePXC.hide();
    }
    var el = $(target);
    pxc.wrapper.css("top", el.offset().top + el.outerHeight(true));
    pxc.wrapper.css("left", el.offset().left - pxc.wrapper.outerWidth(true) + el.outerWidth(true));
    pxc.wrapper.css("visibility","visible");
    document.activePXC = pxc;
    $(document).bind('mousedown', pxc.mousedown);
  };

  pxc.hide = function() {
    document.activePXC = null;
    pxc.wrapper.css("visibility","hidden");
    $(document).unbind('mousedown', pxc.mousedown);
  };

  /**
   * Mousedown handler
   */
  pxc.mousedown = function (event) {
    if(event.target === $(pxc.target).get(0) ) return;
    var parent = event.target.parentElement;
    while(parent) {
      if(parent === container) return;
      parent = parent.parentElement;
    } 
    pxc.hide();
  };

  /**
   * Mouseup handler
   */
  pxc.mouseup = function () {
    $(document).unbind('mouseup', pxc.mouseup);
  };

  pxc.fb.setColor($(target).val());

  $.fn.setColor = function(color) {
    var container = $(this).get(0);
    var ycp = container.yamcolors;
    var rgb = ycp.fb.unpack(color);
    var hsl = ycp.fb.RGBToHSL(rgb);
    $(ycp.target).css({
      backgroundColor: color,
      color: hsl[2] > 0.5 ? '#000' : '#fff'
    });

  };

};

