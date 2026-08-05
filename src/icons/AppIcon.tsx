import React from 'react';
import type { ComponentType } from 'react';


import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import Feather from '@react-native-vector-icons/feather';

const ICONS = {
    material: MaterialDesignIcons,
    ionicons: Ionicons,
    fontawesome: FontAwesome6,
    feather: Feather,
};

export type IconFamily = keyof typeof ICONS;

interface AppIconProps {
    family?: IconFamily;
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

const AppIcon: React.FC<AppIconProps> = ({
    family = 'material',
    name,
    size = 24,
    color = '#000',
    style,
    ...rest
}) => {
    const IconComponent = ICONS[family] as ComponentType<any>;

    if (!IconComponent) {
        console.warn(`Unsupported icon family: ${family}`);
        return null;
    }

    return (
        <IconComponent
            name={name}
            size={size}
            color={color}
            style={style}
            {...rest}
        />
    );
};

export default React.memo(AppIcon);