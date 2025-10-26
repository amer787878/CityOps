import { forwardRef, ReactNode, CSSProperties, ElementType } from 'react';
import classnames from 'classnames';
import { Badge } from 'reactstrap';

interface AvatarProps {
    img?: string;
    size?: string;
    icon?: ReactNode;
    color?: string;
    status?: string;
    badgeUp?: boolean;
    content?: string;
    tag?: ElementType;
    initials?: boolean;
    imgWidth?: string | number;
    imgHeight?: string | number;
    className?: string;
    badgeText?: string;
    badgeColor?: string;
    imgClassName?: string;
    contentStyles?: CSSProperties;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    (
        {
            img,
            size,
            icon,
            color,
            status,
            badgeUp,
            content,
            tag: Tag = 'div',
            initials,
            imgWidth,
            imgHeight,
            className,
            badgeText,
            badgeColor,
            imgClassName,
            contentStyles,
            ...rest
        },
        ref
    ) => {
        // Function to extract initials from content
        const getInitials = (str: string) =>
            str
                .split(' ')
                .map((word) => word[0])
                .join('');

        return (
            <Tag
                className={classnames('avatar', {
                    [className || '']: className,
                    [`bg-${color}`]: color,
                    [`avatar-${size}`]: size,
                })}
                ref={ref}
                {...rest}
            >
                {img ? (
                    <img
                        className={classnames({ [imgClassName || '']: imgClassName })}
                        src={img}
                        alt="avatar"
                        height={imgHeight || 32}
                        width={imgWidth || 32}
                    />
                ) : (
                    <span className="avatar-content" style={contentStyles}>
                        {initials && content ? getInitials(content) : content}
                        {icon}
                    </span>
                )}
                {status && <span className={`avatar-status avatar-status-${status}`}></span>}
                {badgeUp && (
                    <Badge className="badge-up" color={badgeColor || 'primary'}>
                        {badgeText}
                    </Badge>
                )}
            </Tag>
        );
    }
);

export default Avatar;
