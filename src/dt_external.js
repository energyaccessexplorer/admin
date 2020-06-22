dt_plugins['external'] = {
  add_link: function(object, form, link) {
    if (!(object instanceof dt_object))
      throw Error("Expected dt_object");

    const a = elem(`<a href="${link(object.data)}" target="_blank"></a>`);
    form.querySelector(':scope > fieldset > legend').prepend(a);
  }
};
