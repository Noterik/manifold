import { AnnotationRect } from "./AnnotationRect";
export declare class AnnotationGroup {
    canvasIndex: number;
    rects: AnnotationRect[];
    constructor(resource: any, canvasIndex: number);
    addRect(resource: any): void;
}
