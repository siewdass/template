import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom"

window.React = React

const router = createBrowserRouter( Object.keys( exports.config ).map( path => {
  const Component = exports[ exports.config[ path ] ]
  return { path, element: <Component { ...{ useEffect, useState, useNavigate } } /> }
} )  )

const root = createRoot( document.getElementById( "root") )

root.render(
  <RouterProvider router={ router } />
)
