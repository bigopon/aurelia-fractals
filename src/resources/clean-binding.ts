import { viewEngineHooks, ViewFactory, View } from "aurelia-framework";

@viewEngineHooks()
export class ClearBinding {
  afterCompile(viewFactory: ViewFactory & { template: HTMLTemplateElement }) {
    viewFactory.setCacheSize(Infinity, true);
    let targets = Array.from(viewFactory.template.querySelectorAll('.au-target'));
    if (!targets.length) {
      return;
    }
    // remove all bindings from elements
    for (let el of targets) {
      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes[i];
        let name = attr.name;
        if (name === 'ref' || name === 'as-element') {
          el.removeAttributeNode(attr);
          --i;
        } else {
          let parts = name.split('.');
          if (parts.length === 2) {
            el.removeAttribute(attr.name);
            i--;
          }
        }
      }
    }
  }

  afterCreate(view: View & { firstChild: Node }) {
    let targets = (view.firstChild.parentNode as Element).querySelectorAll('.au-target');
    if (!targets.length) {
      return;
    }

    for (let i = 0; i < targets.length; i++) {
      let el = targets[i];
      el.removeAttribute('au-target-id');
      el.classList.remove('au-target');
      if (el.className === '') {
        el.removeAttribute('class');
      }
    }
  }
}
