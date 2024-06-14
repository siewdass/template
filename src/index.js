import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom"

window.React = React

const useFetch = async ( method, url, data, headers = { 'Content-Type': 'application/json' } ) => {
  const response = await fetch( method == 'GET' ? `${ url }?${ new URLSearchParams( data ) }` : url, {
    method,
    headers,
    body: method !== 'GET' ? JSON.stringify( data ) : null
  } )
  return await response.json( )
}

const router = createBrowserRouter( Object.keys( exports.config ).map( path => {
  const Component = exports[ exports.config[ path ] ]
  return { path: path == '/' ? '*' : path , element: <Component { ...{ useEffect, useState, useNavigate, useFetch } } /> }
} )  )

const root = createRoot( document.getElementById( "root") )

root.render(
  <RouterProvider router={ router } />
)
