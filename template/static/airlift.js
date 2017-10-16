import '../node_modules/jquery/dist/jquery'
import './airliftapi'

class AirliftAPI {
  constructor() {
    this.form_structures = {};
  }

  getRecord(form_uuid, column_uuid, value, status) {
    let deferredObject = $.Deferred();

    if (typeof status === 'undefined') {
      status = 'active';
    }

    // Get the objects
    let search_array = {};
    search_array['form_uuid'] = form_uuid;
    search_array[column_uuid] = value;

    if (typeof status === 'undefined') {
      status = 'active';
    }

    airliftapi.search('formrecords', search_array, undefined, undefined, undefined, undefined, undefined, true)
      .done((result) => {
        let data;

        if (result['result']) {
          data = result['result'][0];
        } else {
          data = {};
        }

        deferredObject.resolve(data);
      });

    return this._getRecord(form_uuid, deferredObject);
  }

  getRecordMultiAttribute(form_uuid, constraints, exact, status) {
    let deferredObjects = $.Deferred();

    if (typeof status === 'undefined') {
      status = 'active';
    }

    if (exact === undefined) {
      exact = true;
    }

    // Get the objects
    let search_array = {};

    search_array['form_uuid'] = form_uuid;
    if (status !== null) {
      search_array['status'] = status;
    }

    $.each(constraints, (name, value) => {
      search_array[name] = value;
    });


    airliftapi.search('formrecords', search_array, undefined, undefined, undefined, undefined, undefined, exact)
      .done((result) => {
        deferredObjects.resolve(result['result']);
      });

    return this._getIndexedRecords(form_uuid, deferredObjects);
  }

  searchRecords(form_uuid, value, status) {
    let deferredObjects = $.Deferred();
    if (typeof status === 'undefined') {
      status = 'active';
    }

    // Get the objects
    let search_array = {};
    search_array['form_uuid'] = form_uuid;
    search_array['record_data'] = value;
    if (status !== null) {
      search_array['status'] = status;
    }

    airliftapi.search('formrecords', search_array)
      .done((result) => {
        deferredObjects.resolve(result['result']);
      });

    return this._getIndexedRecords(form_uuid, deferredObjects);
  }

  getRecords(form_uuid, column_uuid, value, status) {
    let deferredObjects = $.Deferred();
    if (typeof status === 'undefined') {
      status = 'active';
    }

    // Get the objects
    let search_array = {};
    search_array['form_uuid'] = form_uuid;
    search_array[column_uuid] = value;
    if (status !== null) {
      search_array['status'] = status;
    }

    airliftapi.search('formrecords', search_array, undefined, undefined, undefined, undefined, undefined, true)
      .done((result) => {
        deferredObjects.resolve(result['result']);
      });

    return this._getRecords(form_uuid, deferredObjects);
  }

  getRecordByUUID(form_uuid, uuid) {
    let deferredObject = $.Deferred();

    // Get the objects
    airliftapi.search('formrecords/' + uuid, {})
      .done((result) => {
        deferredObject.resolve(result['result'][0]);
      });

    return this._getRecord(form_uuid, deferredObject);
  }

  _getRecord(form_uuid, deferredObject) {
    let deferred                 = $.Deferred(),
        deferredFieldDefinitions = this._getStructure(form_uuid);
    let $this = this;

    $.when(deferredFieldDefinitions, deferredObject)
      .done((fieldDefinitions, objectValues) => {
        deferred.resolve($this._structureObject(fieldDefinitions, objectValues));
      });

    return deferred;
  }

  _getRecords(form_uuid, deferredObjects) {
    let deferred                 = $.Deferred(),
        deferredFieldDefinitions = this._getStructure(form_uuid);

    let $this = this;

    // Put it all together
    $.when(deferredFieldDefinitions, deferredObjects)
      .done((fieldDefinitions, objectsValues) => {
        deferred.resolve($this._structureObjects(fieldDefinitions, objectsValues));
      });

    return deferred;
  }

  _getIndexedRecords(form_uuid, deferredObjects) {
    let $this = this;
    let deferred                 = $.Deferred(),
        deferredFieldDefinitions = $this._getStructure(form_uuid);

    // Put it all together
    $.when(deferredFieldDefinitions, deferredObjects)
      .done(function (fieldDefinitions, objectsValues) {
        deferred.resolve($this._structureObjectsIndexed(fieldDefinitions, objectsValues));
      });

    return deferred;
  }

  _getStructure(form_uuid) {
    let $this = this;
    let deferredFieldDefinitions = $.Deferred();

    if (typeof $this.form_structures[form_uuid] === 'undefined') {
      // Get the fieldDefinitions
      airliftapi.search('forms/' + form_uuid, {})
        .done(function (result) {
          let structure = result['result'][0]['fields'];
          $this.form_structures[form_uuid] = structure;
          deferredFieldDefinitions.resolve(structure);
        });
    } else {
      deferredFieldDefinitions.resolve($this.form_structures[form_uuid] );
    }

    return deferredFieldDefinitions;
  }

  _structureObjects(fieldDefinitions, objects) {
    let structuredObjects = [];
    let $this= this;

    if (objects !== undefined) {
      $.each(objects, (i, object) => {
        let structuredObject = $this._structureObject(fieldDefinitions, object);
        structuredObjects.push(structuredObject);
      });
    }

    return structuredObjects;
  }

  _structureObjectsIndexed(fieldDefinitions, objects) {
    let structuredObjects = {};
    let $this = this;

    $.each(objects, (i, object) => {
      structuredObjects[object.uuid] = $this._structureObject(fieldDefinitions, object);
    });

    return structuredObjects;
  }

  _structureObject(fieldDefinitions, object) {
    let fieldsByUUID = this._fieldsByUUID(fieldDefinitions, true);
    let fieldsByLabel = this._fieldsByLabel(fieldDefinitions);
    let properties = AirliftAPI._properties();

    fieldsByLabel.properties = {};

    // Inject data into structure if there were any results
    if (object && object.record_data) {
      $.each(properties, (i, property) => {
        if (object[property]) {
          fieldsByLabel.properties[property] = object[property];
        }
      });
      $.each(object.record_data, (i, row) => {

        if (typeof fieldsByUUID[row.form_field_uuid] !== 'undefined') {
          // Set the field value
          fieldsByUUID[row.form_field_uuid]['value'] = row.record_data;

          // Overwrite any fields that have values
          fieldsByLabel[fieldsByUUID[row.form_field_uuid].label] = fieldsByUUID[row.form_field_uuid];
        }
      });
    } else {
      // No records, return blank
      fieldsByLabel = {};
    }

    return fieldsByLabel;
  }

  static _properties() {
    return [
      'uuid',
      'status',
      'created',
      'updated'
    ];
  }

// Create object with UUIDs as keys
  _fieldsByUUID(fields, clone) {
    if (clone === undefined) {
      clone = false;
    }

    let fieldsByUUID = {};

    $.each(fields, (i, field) => {
      // Clone object to break reference
      fieldsByUUID[field.uuid] =
        clone ? JSON.parse(JSON.stringify(field)) : field;
    });

    return fieldsByUUID;
  }

// Create object with field labels as keys
  _fieldsByLabel(fields, clone) {
    if (clone === undefined) {
      clone = false;
    }

    let fieldsByLabel = {};

    $.each(fields, (i, field) => {
      fieldsByLabel[field.label] =
        clone ? JSON.parse(JSON.stringify(field)) : field;
    });

    return fieldsByLabel;
  }

  getSession() {
    airliftapi.search('sessions', [])
      .done((result) => {
        session = result['result'][0]['user_session'];
      });
  }
}

export default new AirliftAPI();
