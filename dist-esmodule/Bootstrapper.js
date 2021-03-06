import { Helper } from "./Helper";
import { IIIFResourceType } from "@iiif/vocabulary";
import { Utils } from "manifesto.js";
var Bootstrapper = /** @class */ (function () {
    function Bootstrapper(options) {
        this._options = options;
        this._options.locale = this._options.locale || "en-GB"; // default locale
    }
    Bootstrapper.prototype.bootstrap = function (res, rej) {
        var that = this;
        return new Promise(function (resolve, reject) {
            // if this is a recursive bootstrap we will have existing resolve & reject methods.
            if (res && rej) {
                resolve = res;
                reject = rej;
            }
            if (typeof that._options.manifestUri === "object") {
                that._loaded(that, JSON.stringify(that._options.manifestUri), resolve, reject);
            }
            else {
                Utils.loadManifest(that._options.manifestUri).then(function (json) {
                    that._loaded(that, json, resolve, reject);
                });
            }
        });
    };
    Bootstrapper.prototype._loaded = function (bootstrapper, json, resolve, reject) {
        var iiifResource = Utils.parseManifest(json, {
            locale: bootstrapper._options.locale
        });
        if (iiifResource) {
            // only set the root IIIFResource on the first load
            if (!bootstrapper._options.iiifResource) {
                bootstrapper._options.iiifResource = iiifResource;
            }
            var collectionIndex = bootstrapper._options.collectionIndex; // this is either undefined, 0, or a positive number (defaults to undefined)
            var manifestIndex_1 = bootstrapper._options.manifestIndex; // this is either 0 or a positive number (defaults to 0)
            if (iiifResource.getIIIFResourceType() === IIIFResourceType.COLLECTION) {
                // it's a collection
                var manifests = iiifResource.getManifests();
                var collections = (iiifResource).getCollections();
                // if there are only collections available, set the collectionIndex to 0 if undefined.
                if (!manifests.length && collectionIndex === undefined) {
                    collectionIndex = 0;
                }
                if (collectionIndex !== undefined &&
                    collections &&
                    collections.length) {
                    // a collectionIndex has been passed and we have sub collections
                    iiifResource
                        .getCollectionByIndex(collectionIndex)
                        .then(function (collection) {
                        if (!collection) {
                            reject("Collection index not found");
                        }
                        // Special case: we're trying to load the first manifest of the
                        // specified collection, but the collection has no manifests but does have
                        // subcollections. Thus, we should dive in until we find something
                        // we can display!
                        if (collection.getTotalManifests() === 0 &&
                            manifestIndex_1 === 0 &&
                            collection.getTotalCollections() > 0) {
                            bootstrapper._options.collectionIndex = 0;
                            bootstrapper._options.manifestUri = collection.id;
                            bootstrapper.bootstrap(resolve, reject);
                        }
                        else if (manifestIndex_1 !== undefined) {
                            collection
                                .getManifestByIndex(manifestIndex_1)
                                .then(function (manifest) {
                                bootstrapper._options.manifest = manifest;
                                var helper = new Helper(bootstrapper._options);
                                resolve(helper);
                            });
                        }
                    });
                }
                else {
                    iiifResource
                        .getManifestByIndex(bootstrapper._options.manifestIndex)
                        .then(function (manifest) {
                        bootstrapper._options.manifest = manifest;
                        var helper = new Helper(bootstrapper._options);
                        resolve(helper);
                    });
                }
            }
            else {
                bootstrapper._options.manifest = iiifResource;
                var helper = new Helper(bootstrapper._options);
                resolve(helper);
            }
        }
        else {
            console.error("Unable to load IIIF resource");
        }
    };
    return Bootstrapper;
}());
export { Bootstrapper };
//# sourceMappingURL=Bootstrapper.js.map