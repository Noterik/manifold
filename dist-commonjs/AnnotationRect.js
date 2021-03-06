"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnnotationRect = /** @class */ (function () {
    function AnnotationRect(result) {
        this.isVisible = true;
        var xywh = result.on.match(/.*xywh=(\d*),(\d*),(\d*),(\d*)/);
        this.x = Number(xywh[1]);
        this.y = Number(xywh[2]);
        this.width = Number(xywh[3]);
        this.height = Number(xywh[4]);
        this.chars = result.resource.chars;
    }
    return AnnotationRect;
}());
exports.AnnotationRect = AnnotationRect;
//# sourceMappingURL=AnnotationRect.js.map