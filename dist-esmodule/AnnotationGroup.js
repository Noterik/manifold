import { AnnotationRect } from "./AnnotationRect";
var AnnotationGroup = /** @class */ (function () {
    function AnnotationGroup(resource, canvasIndex) {
        this.rects = [];
        this.canvasIndex = canvasIndex;
        this.addRect(resource);
    }
    AnnotationGroup.prototype.addRect = function (resource) {
        var rect = new AnnotationRect(resource);
        rect.canvasIndex = this.canvasIndex;
        rect.index = this.rects.length;
        this.rects.push(rect);
        // sort ascending
        this.rects.sort(function (a, b) {
            return a.index - b.index;
        });
    };
    return AnnotationGroup;
}());
export { AnnotationGroup };
//# sourceMappingURL=AnnotationGroup.js.map