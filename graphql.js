const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const app = express();
const port = 3005;
const { 
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull
} = require("graphql");

const authors = [
{id: 1, name: "Mithun"},
{id: 2, name: "Arshad"}
];

const books = [
{id: 1, name: "My Book", authorId: 1},
{id: 2, name: "My New Book", authorId: 2}
];


const BookType = new GraphQLObjectType({
	name: "Book",
	description: "This represents a book written by author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find(author => author.id === book.authorId)
			} 
		}
	})
});

const AuthorType = new GraphQLObjectType({
	name: "Author",
	description: "This represents an author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		books: {
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter(book => book.authorId === author.id)
			} 
		}
	})
});

const rootQueryType = new GraphQLObjectType({
	name: "Query",
	description: "Root Query",
	fields: () => ({
		book: {
			type: BookType,
			description: "Single book",
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => books.find(book => book.id === args.id)
		},
		books: {
			type: new GraphQLList(BookType),
			description: "List of books",
			resolve: () => books
		},
		author: {
			type: AuthorType,
			description: "Single Author",
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => authors.find(author => author.id === args.id)
		},
		authors: {
			type: new GraphQLList(AuthorType),
			description: "List of Authors",
			resolve: () => authors
		}
	})
});

const rootMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "Root Mutation",
	fields: () => ({
		addBook: {
			type: BookType,
			description: "Add a book",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				authorId: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const book = { id: books.length+1, name: args.name, authorId: args.authorId };
				books.push(book);
				return book;
			}
		}
	})
});


const schema = new GraphQLSchema({
	query: rootQueryType,
	mutation: rootMutationType
});


app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true
}));

app.listen(port, () => {
    console.log(`listening up at ${port}`);
});