// Editor de notas como en Notion: negrita y viñetas visibles mientras se escribe.
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { jsonATexto, textoAJson } from './notaFormat';

export default function NotaEditor({ value, onChange, placeholder, autoFocus }: {
  value: string; onChange: (texto: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, blockquote: false, codeBlock: false, code: false, horizontalRule: false,
        orderedList: false, italic: false, strike: false,
      }),
    ],
    content: textoAJson(value),
    autofocus: autoFocus ? 'end' : false,
    editorProps: { attributes: { class: 'nota-editor-area', 'aria-label': placeholder ?? 'Nota' } },
    onUpdate: ({ editor: e }) => onChange(jsonATexto(e.getJSON())),
  });

  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      lista: e?.isActive('bulletList') ?? false,
      vacio: e?.isEmpty ?? true,
    }),
  });

  return (
    <div className={`nota-editor ${estado?.vacio ? 'is-empty' : ''}`}>
      <div className="nota-toolbar" role="toolbar" aria-label="Formato">
        <button type="button" className={`fmt-btn ${estado?.bold ? 'is-on' : ''}`} aria-pressed={estado?.bold} title="Negrita (Ctrl+B)" aria-label="Negrita"
          onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" className={`fmt-btn ${estado?.lista ? 'is-on' : ''}`} aria-pressed={estado?.lista} title="Lista con viñetas" aria-label="Lista con viñetas"
          onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="nota-editor-body">
        {estado?.vacio && placeholder && <span className="nota-placeholder" aria-hidden="true">{placeholder}</span>}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
