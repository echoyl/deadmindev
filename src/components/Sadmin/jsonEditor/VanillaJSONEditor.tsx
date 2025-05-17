import { JSONEditor } from 'vanilla-jsoneditor';
import { useEffect, useRef } from 'react';
import './VanillaJSONEditor.css';

export default function SvelteJSONEditor(props) {
  const refContainer = useRef(null);
  const refEditor = useRef(null);
  const { height = 400 } = props;

  useEffect(() => {
    // create editor
    //console.log("create editor", refContainer.current);
    refEditor.current = new JSONEditor({
      target: refContainer.current,
      props: {
        mode: 'text',
      },
    });

    return () => {
      // destroy editor
      if (refEditor.current) {
        //console.log("destroy editor");
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  // update props
  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <div className="vanilla-jsoneditor-react" style={{ height }} ref={refContainer}></div>;
}
