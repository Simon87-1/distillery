interface Author {
  reference: string;
  display: string;
}

interface Category {
  text: string;
}

interface Content {
  attachment: {
    contentType: string;
    data: string;
    url: string;
  };
}

interface Type {
  text: string;
}

export interface Document {
  id: number;
  author: Author[];
  date: string | number;
  category: Category[];
  content: Content[];
  type: Type;
}
