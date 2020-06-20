dt_plugins['external'] = {
  add_link: function(o,f) {
    if (!(o instanceof dt_object))
      throw Error("Expected dt_object");

    const a = elem(`<a href="${o.model.external_url(o.data)}" target="_blank"></a>`);
    f.querySelector(':scope > fieldset > legend').prepend(a);
  }
};

let old_dt_edit = dt_edit;
dt_edit = async function() {
  const x = await old_dt_edit.apply(this, arguments);

  let {object, form} = x;

  dt_plugins.external.add_link(object, form);

  return x;
};
